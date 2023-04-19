import React from 'react';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophoneAlt, faStop } from '@fortawesome/free-solid-svg-icons';

type Props = {
    isRecording: boolean;
    setIsRecording: (isRecording: boolean) => void;
}

const TalkButton: React.FC<Props> = ({ isRecording, setIsRecording }) => (
    <Button
        className='talk-button'
        color="primary"
        sx={{ borderRadius: 10 }}
        startIcon={<FontAwesomeIcon icon={isRecording ? faStop : faMicrophoneAlt} />}
        variant="contained"
        name="record"
        onClick={() => setIsRecording(!isRecording)}>
        {
            isRecording ?
                'Pysäytä'
                :
                'Puhu'
        }
    </Button>
);

export default TalkButton;
