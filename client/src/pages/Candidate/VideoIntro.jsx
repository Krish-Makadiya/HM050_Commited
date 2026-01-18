import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Video, Mic, StopCircle, Play, RotateCcw, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const VideoIntro = () => {
    const { user } = useUser();
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [recording, setRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Initial Camera Setup
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera. Please allow permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startRecording = () => {
        setCountdown(3);
        let count = 3;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                beginMediaRecording();
            }
        }, 1000);
    };

    const beginMediaRecording = () => {
        if (!stream) return;
        const chunks = [];
        const mediaRecorder = new MediaRecorder(stream); // Use basic MediaRecorder without specific mimeType to avoid support issues
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setVideoBlob(blob);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            
            // Stop camera stream after recording to show preview
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        mediaRecorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const resetRecording = () => {
        setVideoBlob(null);
        setVideoUrl(null);
        startCamera();
    };

    const saveRecording = async () => {
        if (!videoBlob || !user) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append("video", videoBlob, "pitch.webm");
        formData.append("userId", user.id);

        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_API}/api/upload/video`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                toast.success("Video Pitch saved to your profile!");
                // In a real app, you might want to save response.data.url to the user's profile database entry here
                // For now, we rely on the file existing on the server
            }
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload video.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Video Introduction</h1>
                <p className="text-muted-foreground">
                    Record a 30-second elevator pitch to stand out to recruiters.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Recorder / Player */}
                <Card className="overflow-hidden border-2 border-neutral-200 dark:border-neutral-800 bg-black aspect-video relative flex items-center justify-center rounded-2xl shadow-2xl">
                    {countdown > 0 && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <span className="text-9xl font-bold text-white animate-ping">{countdown}</span>
                        </div>
                    )}
                    
                    {videoUrl ? (
                        <video 
                            src={videoUrl} 
                            controls 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            className="w-full h-full object-cover transform scale-x-[-1]" 
                        />
                    )}

                    {!stream && !videoUrl && (
                        <div className="text-neutral-500 flex flex-col items-center gap-2">
                            <Video className="w-12 h-12" />
                            <p>Camera Off</p>
                        </div>
                    )}
                    
                    {recording && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            Recording
                        </div>
                    )}
                </Card>

                {/* Controls */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tips for a Great Pitch</CardTitle>
                        </CardHeader> 
                        <CardContent className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <ul className="list-disc pl-4 space-y-2">
                                <li><strong>Introduce yourself</strong> clearly (Name, Role).</li>
                                <li>Highlight your <strong>top 2 skills</strong> relevant to the job.</li>
                                <li>Mention a <strong>cool project</strong> you built.</li>
                                <li>Keep it under <strong>60 seconds</strong>.</li>
                                <li>Smile and look at the camera!</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        {!recording && !videoUrl && (
                            <Button size="lg" className="w-full gap-2 text-lg h-14" onClick={startRecording}>
                                <div className="w-4 h-4 rounded-full bg-red-500 border border-white"></div>
                                Start Recording
                            </Button>
                        )}

                        {recording && (
                            <Button size="lg" variant="destructive" className="w-full gap-2 text-lg h-14" onClick={stopRecording}>
                                <StopCircle className="w-6 h-6" />
                                Stop Recording
                            </Button>
                        )}

                        {videoUrl && (
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-12 gap-2" onClick={resetRecording} disabled={uploading}>
                                    <RotateCcw className="w-4 h-4" />
                                    Retake
                                </Button>
                                <Button className="h-12 gap-2" onClick={saveRecording} disabled={uploading}>
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Pitch
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoIntro;
