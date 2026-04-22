"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Loading from "../PatientDashboard/loading";

interface DailyTask {
  id: string;
  userId: string;
  disorder: string;
  severity: string;
  week: number;
  day: number;
  task: string;
  status: "pending" | "completed" | "skipped" | string;
  reflection?: string;
  createdAt: string;
}

interface VideoActivity {
  id: string;
  userId: string;
  disorder: string;
  severity: string;
  week: number;
  day: number;
  activity: string;
  status: "pending" | "completed" | "skipped" | string;
  reflection?: string;
  createdAt: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Record<number, Record<number, DailyTask[]>>>({});
  const [videos, setVideos] = useState<VideoActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  // Maps activity DB id → fetched YouTube video id
  const [youtubeIds, setYoutubeIds] = useState<Record<string, string>>({});
  const [videoLoading, setVideoLoading] = useState<Record<string, boolean>>({});
  const [videoError, setVideoError] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/youtube-activities/assign").then((r) => r.json()),
    ])
      .then(([taskData, videoData]) => {
        setTasks(taskData);
        setVideos(Array.isArray(videoData) ? videoData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const dayTasks = tasks[selectedWeek]?.[selectedDay] ?? [];
  const dayVideos = videos.filter(
    (v) => v.week === selectedWeek && v.day === selectedDay
  );

  const handleTakeActivity = async (taskId: string) => {
    await fetch("/api/tasks/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: "completed" }),
    });
    setTasks((prev) => ({
      ...prev,
      [selectedWeek]: {
        ...prev[selectedWeek],
        [selectedDay]: prev[selectedWeek][selectedDay].map((t) =>
          t.id === taskId ? { ...t, status: "completed" } : t
        ),
      },
    }));
  };

  const handleLoadVideo = async (activityId: string, query: string) => {
    setVideoLoading((prev) => ({ ...prev, [activityId]: true }));
    setVideoError((prev) => ({ ...prev, [activityId]: "" }));
    try {
      const res = await fetch(`/api/youtube?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok || !data.bestVideo?.id) {
        setVideoError((prev) => ({
          ...prev,
          [activityId]: data.error || "No video found for this activity.",
        }));
        return;
      }
      setYoutubeIds((prev) => ({ ...prev, [activityId]: data.bestVideo.id }));
    } catch {
      setVideoError((prev) => ({ ...prev, [activityId]: "Failed to load video." }));
    } finally {
      setVideoLoading((prev) => ({ ...prev, [activityId]: false }));
    }
  };

  const handleMarkVideoDone = async (activityId: string) => {
    await fetch("/api/youtube-activities/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: activityId, status: "completed" }),
    });
    setVideos((prev) =>
      prev.map((v) => (v.id === activityId ? { ...v, status: "completed" } : v))
    );
  };

  const statusColor = (status: string) =>
    status === "completed"
      ? "text-green-700"
      : status === "skipped"
      ? "text-red-700"
      : "text-blue-700";

  const statusLabel = (status: string) =>
    status === "completed" ? "Completed" : status === "skipped" ? "Skipped" : "Pending";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
        Task Manager - Weekly Challenge
      </h1>

      {/* Week Selection */}
      <div className="flex justify-center gap-4 mb-4">
        {[1, 2, 3, 4, 5].map((week) => (
          <Button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`px-4 py-2 ${selectedWeek === week ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-800"}`}
          >
            Week {week}
          </Button>
        ))}
      </div>

      {/* Day Selection */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <Button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 ${selectedDay === day ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-800"}`}
          >
            Day {day}
          </Button>
        ))}
      </div>

      {/* Physical / Thoughtful Tasks */}
      {dayTasks.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {dayTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border rounded-xl shadow-lg bg-blue-50 border-blue-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.task}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {task.disorder} · {task.severity}
                </p>
                <span className={`font-bold ${statusColor(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
                <div className="mt-4">
                  <Button
                    onClick={() => handleTakeActivity(task.id)}
                    disabled={task.status !== "pending"}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-transform disabled:opacity-50"
                  >
                    Mark as Done
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
      {dayTasks.length === 0 && (
        <p className="text-center text-gray-500 mb-8">No physical/thoughtful tasks for this day.</p>
      )}

      {/* Video Activities */}
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Video Activities</h2>
      {dayVideos.length > 0 ? (
        <div className="flex flex-col gap-8">
          {dayVideos.map((activity) => {
            const ytId = youtubeIds[activity.id];
            const isLoadingVideo = videoLoading[activity.id];
            const errMsg = videoError[activity.id];

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-xl shadow-lg bg-purple-50 border-purple-300 overflow-hidden"
              >
                <div className="p-6">
                  <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Video Activity</p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{activity.activity}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {activity.disorder} · {activity.severity}
                  </p>
                  <span className={`font-bold ${statusColor(activity.status)}`}>
                    {statusLabel(activity.status)}
                  </span>

                  {activity.status === "pending" && !ytId && (
                    <div className="mt-4">
                      <Button
                        onClick={() => handleLoadVideo(activity.id, activity.activity)}
                        disabled={isLoadingVideo}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-transform disabled:opacity-50"
                      >
                        {isLoadingVideo ? "Loading video..." : "Watch Video"}
                      </Button>
                      {errMsg && <p className="text-red-500 text-sm mt-2">{errMsg}</p>}
                    </div>
                  )}

                  {ytId && activity.status === "pending" && (
                    <div className="mt-4">
                      <Button
                        onClick={() => handleMarkVideoDone(activity.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-transform"
                      >
                        Mark as Done
                      </Button>
                    </div>
                  )}
                </div>

                {/* Embedded YouTube player */}
                {ytId && (
                  <div className="w-full aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                      title={activity.activity}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No video activities for this day.</p>
      )}
    </div>
  );
};

export default TaskManager;
