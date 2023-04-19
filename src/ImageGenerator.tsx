import React, { useEffect, useState } from 'react';
import BounceLoader from "react-spinners/BounceLoader";
import './ImageGenerator.css';
import { useReactMediaRecorder } from "react-media-recorder";
import { WhatsappShareButton, WhatsappIcon } from 'react-share';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophoneAlt, faStop, faUserAstronaut } from '@fortawesome/free-solid-svg-icons';

const blobToBase64 = (blob: Blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            resolve(reader.result);
        };
    });
};

const waitFiveSeconds = () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 5000);
    });
}

const ImageGenerator: React.FC = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { startRecording, stopRecording, mediaBlobUrl } =
        useReactMediaRecorder({ audio: true });


    const handleOnSubmit = async () => {
        try {
            if (mediaBlobUrl) {
                let blob = await fetch(mediaBlobUrl).then(r => r.blob());
                const b64 = await blobToBase64(blob);
                setImageUrl(null);
                setIsLoading(true);

                const rawInitRes = await fetch("/transcribe", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }, method: 'POST', body: JSON.stringify({ blobAsB64: b64 })
                });
                const initRes = await rawInitRes.json();

                let imageRes;
                while (true) {
                    // Replicate is sometimes extremely slow and Heroku has a 30 second timeout. 
                    // That is why we poll the backend every 5 seconds to check if the image has been generated.
                    await waitFiveSeconds();
                    const rawImageRes = await fetch("/image?" + new URLSearchParams({
                        'url': initRes.url,
                    }), {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }, method: 'GET'
                    });
                    imageRes = await rawImageRes.json();

                    // TODO What if status is something else?
                    if (imageRes.status === 'succeeded') break;
                }

                setImageUrl(imageRes.url);
            } else {
                console.log('audioBlob is null');
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setError('Hups. Jotain meni pieleen.');
        }
    }

    const handleOnRecord = async () => {
        setIsRecording(!isRecording);
    }

    useEffect(() => {
        if (isRecording) {
            setError(null);
            startRecording();
        }
        if (!isRecording) {
            stopRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    return (
        <div className="image-generator">
            <div className='title'>Mitä haluaisit nähdä?</div>
            <Button
                className='talk-button'
                color="primary"
                sx={{ borderRadius: 10 }}
                startIcon={<FontAwesomeIcon icon={isRecording ? faStop : faMicrophoneAlt} />}
                variant="contained" name="record" onClick={handleOnRecord}>
                {isRecording ?
                    'Pysäytä'
                    :
                    'Puhu'
                }
            </Button>
            <Button
                disabled={!mediaBlobUrl}
                startIcon={<FontAwesomeIcon icon={faUserAstronaut} />}
                variant="contained"
                color="success"
                onClick={handleOnSubmit}
                sx={{ borderRadius: 10 }}
            >
                Luo kuva
            </Button>
            {isLoading &&
                <BounceLoader
                    loading={isLoading}
                    size={50}
                    color="#36D7B7"
                    className='loading-indicator'
                />
            }
            {error && <div>{error}</div>}
            {imageUrl &&
                <>
                    <img src={imageUrl} className="image-generator__image" alt="Puheen perusteella luotu kuva" />
                    <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ borderRadius: 10 }}
                        startIcon={<WhatsappIcon round size={32} className='whatsapp-icon' />}
                    >
                        <WhatsappShareButton
                            url={imageUrl}
                            title="Katso, tein tämän kuvan tekoälyllä!"
                        >
                            Jaa kuva
                        </WhatsappShareButton>
                    </Button>
                </>
            }
        </div>
    );
}

export default ImageGenerator;
