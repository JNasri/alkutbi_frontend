import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const useInactivityLogout = (timeoutMs = 600000) => { // 10 minutes default
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const timerRef = useRef(null);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            handleLogout();
        }, timeoutMs);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        toast('Logged out due to inactivity', { icon: '🕒' });
    };

    useEffect(() => {
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart'
        ];

        const handleActivity = () => resetTimer();

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        resetTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);
};

export default useInactivityLogout;
