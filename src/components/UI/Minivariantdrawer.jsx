import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItemButton from '@mui/material/ListItemButton';
import Button from '@mui/material/Button';
import { FaBroadcastTower, FaMapMarkerAlt } from 'react-icons/fa';
import { RiShip2Line } from 'react-icons/ri';
import { BsBroadcast } from 'react-icons/bs';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { useContext } from 'react';
import { AppContext } from '../../App';
import { FaArrowsAlt } from 'react-icons/fa';
import { RiFilterOffLine } from 'react-icons/ri';
import BookmarkList from './BookmarkList';
import { FaBookBookmark } from 'react-icons/fa6';
import { FaRedoAlt } from 'react-icons/fa';
import { List, ListItem, ListItemText, ListItemIcon, IconButton, Typography } from '@mui/material';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  height: '100vh', // Set fixed height
  overflowY: 'auto', // Make it scrollable
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  height: '100vh', // Set fixed height
  overflowY: 'auto', // Make it scrollable
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end', // Keep the close button aligned to the end
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const { handleInteractionModeChange, toggleVisibility, visibility, bookmarks, setBookmarkPosition, decayRate, setDecayRate, handleReplayClick, pauseReplay, setPauseReplay, replay, setReplay } = useContext(AppContext); // Use the context to get the function

  return (
    <Box sx={{ display: 'flex', height: '100vh', zIndex: 1000 }}> {/* Ensure full height */}
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }} // Center the open button
            >
              <MenuIcon />
            </IconButton>
          )}
          {open && (
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </DrawerHeader>
        <List>
          {/* <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <FaRedoAlt />
              </ListItemIcon>
              <ListItemText
                primary="Replay"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem> */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
              onClick={() => handleInteractionModeChange('Placemark')}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <FaMapMarkerAlt />
              </ListItemIcon>
              <ListItemText
                primary="Add Marker"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
              onClick={() => handleInteractionModeChange('Boat')}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <RiShip2Line />
              </ListItemIcon>
              <ListItemText
                primary="Ship"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem> */}
          {/* <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <BsBroadcast />
              </ListItemIcon>
              <ListItemText
                primary="Signal"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem> */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
              onClick={() => handleInteractionModeChange('area')} // Set interaction mode to "area"
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <FaMapMarkedAlt /> {/* Icon for AOR */}
              </ListItemIcon>
              <ListItemText
                primary="AOR"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
              onClick={() => handleInteractionModeChange('dragging')} // Set interaction mode to "dragging"
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <FaArrowsAlt />
              </ListItemIcon>
              <ListItemText
                primary="Dragging"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem> */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
              onClick={() => toggleVisibility('areas')} // Toggle visibility of AORs
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <RiFilterOffLine />
              </ListItemIcon>
              <ListItemText
                primary={`AOR Visibility (${visibility.areas ? 'On' : 'Off'})`}
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {open ? (
              <ListItemText>
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="body2" className="block font-bold mb-2">Set Decay Rate (ms):</Typography>
                  <input
                    type="number"
                    value={decayRate}
                    onChange={(e) => setDecayRate(parseInt(e.target.value, 10))}
                    className="border rounded p-2"
                    min="1000"
                    style={{ fontSize: '0.75rem', width: '100px', margin: '0 auto' }} // Adjust font size and center input
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mx: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReplayClick}
                    className="mb-2"
                    sx={{ fontSize: '0.75rem', padding: '6px 12px' }} // Adjust button size
                  >
                    Replay All Lines
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setPauseReplay(!pauseReplay)}
                    disabled={!replay}
                    sx={{ fontSize: '0.75rem', padding: '6px 12px' }} // Adjust button size
                  >
                    {pauseReplay ? "Resume Replay" : "Pause Replay"}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setReplay(false)}
                    disabled={!replay}
                    sx={{ fontSize: '0.75rem', padding: '6px 12px' }} // Adjust button size
                  >
                    Stop Replay
                  </Button>
                </Box>
              </ListItemText>
            ) : (
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: 'center',
                  }}
                >
                  <FaRedoAlt />
                </ListItemIcon>
              </ListItemButton>
            )}
          </ListItem>
        </List>
        {open ? (
          <BookmarkList bookmarks={bookmarks} setBookmarkPosition={setBookmarkPosition} />
        ) : (
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: 'center',
                }}
              >
                <FaBookBookmark />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        )}
      </Drawer>
    </Box>
  );
}