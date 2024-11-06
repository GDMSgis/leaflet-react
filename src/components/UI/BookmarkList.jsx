import { List, ListItem, ListItemText, ListItemIcon, IconButton, Typography } from '@mui/material';
import { FaBookBookmark } from 'react-icons/fa6';
import React, { useContext } from 'react';
import { MarkerContext } from '../../context/MarkerContext';

// Bookmark List component
function BookmarkList() {
    const { bookmarks, setBookmarkPosition, getIcon } = useContext(MarkerContext);



    return (
        <div style={{ overflowY: 'auto', height: 'calc(100vh - 200px)' }}> {/* Adjust height as needed */}
            <div className="flex items-center gap-5 font-bold text-2xl p-1 mb-0 ml-5 underline">
                <div>Bookmarks</div>
                <FaBookBookmark size={34} />
            </div>
            <List>
                {bookmarks.map((bookmark, index) => (
                    <ListItem
                        key={bookmark.id || index} // Ensure a unique key prop
                        button
                        onClick={() => setBookmarkPosition(bookmark.latlng)}
                    >
                        <ListItemIcon
                            sx={{ minWidth: 30 }} // Adjust the minWidth to decrease the gap
                        >
                            {getIcon(bookmark.type)}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body1" component="span">
                                    {bookmark.type}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="body2" component="span" align="center" sx={{ width: '100%' }}>
                                    <br />{bookmark.description} <br />
                                    Lat: {bookmark.latlng.lat.toFixed(2)}, Lng: {bookmark.latlng.lng.toFixed(2)}
                                </Typography>
                            }
                            sx={{ marginLeft: 0.5 }} // Adjust the margin to make the text closer to the icon
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default BookmarkList;