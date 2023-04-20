import React from 'react';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';
import Button from '@mui/material/Button';

type Props = {
    imageUrl: string;
}

const ShareInWhatsappButton: React.FC<Props> = ({ imageUrl }) => (
    <Button
        variant="outlined"
        color="secondary"
        sx={{ borderRadius: 10 }}
        startIcon={<WhatsappIcon round size={32} className="whatsapp-icon" />}
    >
        <WhatsappShareButton
            url={imageUrl}
            title="Katso, tein tämän kuvan tekoälyllä!"
        >
            Jaa kuva
        </WhatsappShareButton>
    </Button>
);

export default ShareInWhatsappButton;
