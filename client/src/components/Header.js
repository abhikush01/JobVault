import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";

const StyledLink = styled(Link)(({ theme }) => ({
  color: "inherit",
  textDecoration: "none",
  margin: theme.spacing(0, 2),
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      <ListItem component={Link} to="/about" onClick={handleDrawerToggle}>
        <ListItemText primary="About" />
      </ListItem>
      <ListItem component={Link} to="/contact" onClick={handleDrawerToggle}>
        <ListItemText primary="Contact" />
      </ListItem>
      <ListItem>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          component={Link}
          to="/user"
          sx={{ mb: 1 }}
        >
          Job Seeker
        </Button>
      </ListItem>
      <ListItem>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          component={Link}
          to="/recruiter"
        >
          Recruiter
        </Button>
      </ListItem>
    </List>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "primary.main",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            Aspire Match
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  "& .MuiDrawer-paper": {
                    width: 240,
                    boxSizing: "border-box",
                  },
                }}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <StyledLink to="/about">About</StyledLink>
              <StyledLink to="/contact">Contact</StyledLink>
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                to="/user"
                sx={{ ml: 2, mr: 1 }}
              >
                Job Seeker
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/recruiter"
              >
                Recruiter
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
