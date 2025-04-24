"use client";
import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, IconButton
} from '@mui/material';
import { Home, Build, ListAlt, MoreHoriz, Menu } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const drawerWidth = 250;

const HospiwiseSidebar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true); // <- Sidebar is open by default

  const handleDrawerToggle = () => setOpen(!open);

  return (
    <>
      <IconButton
        color="primary"
        onClick={handleDrawerToggle}
        sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1300 }}
      >
        <Menu />
      </IconButton>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#f5f5f5',
            padding: '20px 10px',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', marginBottom: '30px',  }}>
          <Image
            src="/hospiwise.png"
            alt="Hospiwise Logo"
            style={{ width: '80%', maxWidth: '150px', marginBottom: '20px', marginLeft: '20px', height: 'auto' }}
          />
        </Box>
        <Divider />
        <List>
          <ListItem onClick={() => router.push('/')}>
            <ListItemIcon><Home /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem  onClick={() => router.push('/equipments')}>
            <ListItemIcon><Build /></ListItemIcon>
            <ListItemText primary="Equipments" />
          </ListItem>
          <ListItem onClick={() => router.push('/maintainance-logs')}>
            <ListItemIcon><ListAlt /></ListItemIcon>
            <ListItemText primary="Maintenance Logs" />
          </ListItem>
          <ListItem >
            <ListItemIcon><MoreHoriz /></ListItemIcon>
            <ListItemText primary="More" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default HospiwiseSidebar;
