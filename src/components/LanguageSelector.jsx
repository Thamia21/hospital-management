import React, { useState } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const LanguageSelector = ({ variant = 'menu', size = 'medium' }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    handleClose();
  };

  const currentLang = LANGUAGES[currentLanguage];

  if (variant === 'dropdown') {
    return (
      <FormControl size={size} sx={{ minWidth: 150 }}>
        <Select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          {Object.values(LANGUAGES).map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{lang.flag}</Typography>
                <Typography variant="body2">{lang.nativeName}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (variant === 'chip') {
    return (
      <Tooltip title={t('login.selectLanguage', 'Select Language')}>
        <Chip
          icon={<LanguageIcon />}
          label={`${currentLang.flag} ${currentLang.nativeName}`}
          onClick={handleClick}
          variant="outlined"
          size={size}
          sx={{
            cursor: 'pointer',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              color: 'rgba(0, 0, 0, 0.9)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        />
      </Tooltip>
    );
  }

  // Default menu variant
  return (
    <>
      <Tooltip title={t('login.selectLanguage', 'Select Language')}>
        <IconButton
          onClick={handleClick}
          size={size}
          sx={{
            color: 'rgba(0, 0, 0, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              color: 'rgba(0, 0, 0, 0.9)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2">{currentLang.flag}</Typography>
            <LanguageIcon fontSize="small" />
            <ExpandMoreIcon fontSize="small" />
          </Box>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 280,
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('login.selectLanguage', 'Select Language')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            South African Official Languages
          </Typography>
        </Box>

        {Object.values(LANGUAGES).map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === currentLanguage}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="h6">{lang.flag}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={lang.nativeName}
              secondary={lang.name}
              primaryTypographyProps={{
                fontWeight: lang.code === currentLanguage ? 'bold' : 'normal'
              }}
            />
          </MenuItem>
        ))}

        <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            🇿🇦 Proudly South African
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default LanguageSelector;
