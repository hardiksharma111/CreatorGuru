import json
import os
import re
import sys
from collections import defaultdict
from typing import Dict, List, Set, Tuple

try:
    import praw
except Exception as error:  # pragma: no cover
    print(json.dumps({"ok": False, "error": f"praw import failed: {error}"}))
    sys.exit(0)

STOP_WORDS = {
    "the", "and", "for", "with", "that", "this", "from", "your", "into", "just", "have", "what", "when",
    "how", "why", "are", "you", "our", "about", "was", "were", "will", "can", "its", "it's", "their",
    "they", "them", "new", "best", "tips", "idea", "ideas", "guide", "video", "videos", "post", "posts"
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s]", " ", text.lower())).strip()


def tokenize(text: str) -> List[str]:
    cleaned = normalize(text)
    words = [word for word in cleaned.split(" ") if len(word) > 2 and word not in STOP_WORDS]
    return words


def generate_terms(title: str) -> List[str]:
    words = tokenize(title)
    terms = list(words)

    for index in range(len(words) - 1):
        bigram = f"{words[index]} {words[index + 1]}"
        if len(bigram) > 6:
            terms.append(bigram)

    return terms


def collect_keywords(niche: str) -> Dict[str, object]:
    client_id = os.getenv("REDDIT_CLIENT_ID", "").strip()
    client_secret = os.getenv("REDDIT_CLIENT_SECRET", "").strip()
    user_agent = os.getenv("REDDIT_USER_AGENT", "").strip() or "contentguru-trend-radar/1.0"

    if not client_id or not client_secret:
        return {
            "ok": False,
            "error": "Missing Reddit credentials. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET."
        }

    subreddit_names = [name.strip() for name in os.getenv("REDDIT_SUBREDDITS", "all,YouTube,NewTubers,Instagram,TikTokhelp").split(",") if name.strip()]
    limit_per_sub = int(os.getenv("REDDIT_LIMIT_PER_SUB", "40"))

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
        check_for_async=False
    )

    topic_map: Dict[str, Dict[str, object]] = defaultdict(lambda: {
        "score": 0.0,
        "mentions": 0,
        "sampleSubreddits": set(),
        "samplePosts": []
    })

    for subreddit_name in subreddit_names:
        subreddit = reddit.subreddit(subreddit_name)

        try:
            posts = subreddit.search(niche, sort="relevance", time_filter="month", limit=limit_per_sub)
        except Exception:
            continue

        for post in posts:
            title = (post.title or "").strip()
            if not title:
                continue

            terms = generate_terms(title)
            if not terms:
                continue

            weight = 1.0 + min(5.0, (post.score or 0) / 300.0) + min(3.0, (post.num_comments or 0) / 80.0)

            for term in terms[:6]:
                entry = topic_map[term]
                entry["score"] = float(entry["score"]) + weight
                entry["mentions"] = int(entry["mentions"]) + 1
                cast_subs: Set[str] = entry["sampleSubreddits"]  # type: ignore[assignment]
                cast_subs.add(str(post.subreddit.display_name))

                cast_posts: List[str] = entry["samplePosts"]  # type: ignore[assignment]
                if len(cast_posts) < 3:
                    cast_posts.append(title)

    ranked: List[Tuple[str, Dict[str, object]]] = sorted(
        topic_map.items(),
        key=lambda item: (float(item[1]["score"]), int(item[1]["mentions"])),
        reverse=True
    )

    keywords = []
    for topic, payload in ranked[:12]:
        sample_subreddits = sorted(list(payload["sampleSubreddits"]))[:3]
        keywords.append(
            {
                "topic": topic,
                "score": round(float(payload["score"]), 2),
                "mentions": int(payload["mentions"]),
                "sampleSubreddits": sample_subreddits,
                "samplePosts": list(payload["samplePosts"])
            }
        )

    return {
        "ok": True,
        "source": "reddit-praw",
        "keywords": keywords
    }


def main() -> None:
    niche = "creator economy"
    if len(sys.argv) > 1 and sys.argv[1].strip():
        niche = sys.argv[1].strip()

    try:
        payload = collect_keywords(niche)
    except Exception as error:  # pragma: no cover
        payload = {
            "ok": False,
            "error": f"Reddit pipeline failed: {error}"
        }

    print(json.dumps(payload))


if __name__ == "__main__":
    main()
