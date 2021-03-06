import React, {useState} from 'react';
import LoginDialog from './LoginDialog';
import {withPage} from '../../routes/page';

const LoginPage = () => {
    const [open, setOpen] = useState(true);

    const handleClose = () => setOpen(false);

    return (
        <LoginDialog open={open} onClose={handleClose} />
    );
};

// Wrap in page HOC
export default withPage(LoginPage, {title: 'Login'});