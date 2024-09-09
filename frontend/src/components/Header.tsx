import React, { useState } from 'react';
import { setNoticePopUp } from '../redux/slice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import Cookies from 'js-cookie';
import { HeaderTranslations } from '../translation/Header';
import { useNavigate } from 'react-router-dom';
import logout from "../util/logout";
import { getDecodedToken } from "../util/jwtDecoder";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

const Header = () => {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const language = useSelector((state: RootState) => state.app.language);
    const notice_popup = useSelector((state: RootState) => state.app.notice_popup);
    const translations = HeaderTranslations[language];
    const isAdmin = getDecodedToken()?.admin;
    const isCookieSet = Cookies.get('token') !== undefined;

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        logout(navigate, dispatch);
    };

    const noticePopUpOn = () => {
        const clearing = () => {
            dispatch(setNoticePopUp({ on: false, is_error: null, message: '' }));
        };

        setTimeout(clearing, 3000);

        return (
            <div className="header_pop_up_wrap">
                <div className={`${notice_popup.is_error ? 'header_pop_up hpu_error' : 'header_pop_up hpu_inst'}`}>
                    {`${notice_popup.message}`}
                </div>
            </div>
        );
    };

    const pagesUser = [
        { name: translations.main, path: '/main' },
        { name: translations.board, path: '/board' }
    ];

    const pagesAdmin = [
        { name: translations.main, path: '/admin/main' },
        { name: translations.board, path: '/board' }
    ];

    const settings = [
        { name: translations.account, path: '/account' },
        { name: translations.register, path: '/register_child' },
        'Logout'
    ];

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>

                    <VaccinesIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        {translations.brand}
                    </Typography>

                    {isCookieSet && (
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="open navigation menu"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                                {(isAdmin ? pagesAdmin : pagesUser).map((page) => (
                                    <MenuItem key={page.name} onClick={() => navigate(page.path)}>
                                        <Typography textAlign="center">{page.name}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    )}


                    <VaccinesIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap

                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        {translations.brand}
                    </Typography>

                    {isCookieSet && (
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {(isAdmin ? pagesAdmin : pagesUser).map((page) => (
                                <Button
                                    key={page.name}
                                    onClick={() => navigate(page.path)}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page.name}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {isCookieSet && (
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title={translations.settings}>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <TuneRoundedIcon />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem
                                        key={typeof setting === 'string' ? setting : setting.name}
                                        onClick={() =>
                                            setting === 'Logout' ? handleLogout() : navigate(typeof setting === 'string' ? setting : setting.path)
                                        }
                                    >
                                        <Typography textAlign="center">
                                            {typeof setting === 'string' ? translations.logout : setting.name}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </Container>

            {notice_popup.on && noticePopUpOn()}
        </AppBar>
    );
};

export default Header;
