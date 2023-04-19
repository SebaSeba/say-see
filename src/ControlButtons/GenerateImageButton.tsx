import React from 'react';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserAstronaut } from '@fortawesome/free-solid-svg-icons';

type Props = {
    disabled: boolean;
    onClick: () => Promise<void>;
}

const GenerateImageButton: React.FC<Props> = ({ disabled, onClick }) => (
    <Button
        disabled={disabled}
        startIcon={<FontAwesomeIcon icon={faUserAstronaut} />}
        variant="contained"
        color="success"
        onClick={onClick}
        sx={{ borderRadius: 10 }}
    >
        Luo kuva
    </Button>
)

export default GenerateImageButton;