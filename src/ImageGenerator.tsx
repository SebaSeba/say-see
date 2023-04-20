import React, { useEffect, useState } from 'react';
import BounceLoader from "react-spinners/BounceLoader";
import { useReactMediaRecorder } from "react-media-recorder";
import { blobToBase64, waitTwoSeconds } from './ImageGenerator.helpers';
import TalkButton from './ControlButtons/TalkButton';
import './ImageGenerator.css';
import GenerateImageButton from './ControlButtons/GenerateImageButton';
import ShareInWhatsappButton from './ControlButtons/ShareInWhatsAppButton';

const ImageGenerator: React.FC = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { startRecording, stopRecording, mediaBlobUrl } =
        useReactMediaRecorder({ audio: true });


    const generateImage = async () => {
        try {
            if (mediaBlobUrl) {
                let recordedBlob = await fetch(mediaBlobUrl).then(r => r.blob());
                const recordedBase64 = await blobToBase64(recordedBlob);
                setImageUrl(null);
                setIsLoading(true);

                const rawInitTranscribingRes = await fetch("/transcribe", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }, method: 'POST', body: JSON.stringify({ blobAsB64: recordedBase64 })
                });
                const initTranscribingRes = await rawInitTranscribingRes.json();

                let imageRes;
                while (true) {
                    // Replicate is sometimes extremely slow and Heroku has a 30 second timeout. 
                    // That is why we poll the backend every 2 seconds to check if the image has been generated.
                    // Backend returns the response immediately.
                    await waitTwoSeconds();
                    const rawImageRes = await fetch("/image?" + new URLSearchParams({
                        'checkIfTranscribingFinishedUrl': initTranscribingRes.checkIfTranscribingFinishedUrl,
                    }), {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }, method: 'GET'
                    });
                    imageRes = await rawImageRes.json();

                    if (imageRes.status === 'succeeded') break;
                }

                setImageUrl(imageRes.url);
            } else {
                // TODO Error handling
                console.log('audioBlob is null');
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setError('Hups. Jotain meni pieleen.');
        }
    }

    useEffect(() => {
        if (isRecording) {
            setError(null);
            startRecording();
        } else {
            stopRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    return (
        <div className="image-generator">
            <div className="title">Mitä haluaisit nähdä?</div>
            <TalkButton setIsRecording={setIsRecording} isRecording={isRecording} />
            <GenerateImageButton onClick={generateImage} disabled={!mediaBlobUrl} />
            {isLoading &&
                <BounceLoader
                    loading={isLoading}
                    size={50}
                    color="#36D7B7"
                    className="loading-indicator"
                />
            }
            {error && <div>{error}</div>}
            {imageUrl &&
                <>
                    <img src={imageUrl} className="image-generator__image" alt="Puheen perusteella luotu kuva" />
                    <ShareInWhatsappButton imageUrl={imageUrl} />
                </>
            }
        </div>
    );
}

export default ImageGenerator;
