import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEO_DETAILS_URL =
  "https://www.googleapis.com/youtube/v3/videos";

interface VideoStats {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  likes: number;
  views: number;
}

// Helper function to fetch video statistics
const getVideoDetails = async (videoId: string): Promise<VideoStats | null> => {
  try {
    const response = await fetch(
      `${YOUTUBE_VIDEO_DETAILS_URL}?part=statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    const stats = data.items?.[0]?.statistics;
    if (!stats) return null;

    return {
      id: videoId,
      title: "",
      description: "",
      thumbnail: "",
      likes: parseInt(stats.likeCount || "0", 10),
      views: parseInt(stats.viewCount || "0", 10),
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    return null;
  }
};

// API Route
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  console.log(query);
  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "YouTube API key is missing" }, { status: 500 });
  }

  try {
    const searchResponse = await fetch(
      `${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ error: "No videos found" }, { status: 404 });
    }

    const videoPromises = searchData.items.map(async (video: any) => {
      const videoId = video.id.videoId;
      const details = await getVideoDetails(videoId);
      return {
        id: videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.high?.url || "",
        likes: details?.likes ?? 0,
        views: details?.views ?? 0,
      };
    });

    const videos: VideoStats[] = await Promise.all(videoPromises);

    videos.sort((a, b) => b.likes - a.likes || b.views - a.views);

    return NextResponse.json({ bestVideo: videos[0], allVideos: videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
