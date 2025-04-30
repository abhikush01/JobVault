import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(8, 0),
  marginTop: 'auto',
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  display: 'block',
  marginBottom: theme.spacing(1),
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const footerSections = [
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: '/about' },
        { text: 'Careers', href: '/careers' },
        { text: 'Press', href: '/press' },
        { text: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Community', href: '/community' },
        { text: 'Partners', href: '/partners' },
        { text: 'Events', href: '/events' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Terms of Service', href: '/terms' },
        { text: 'Cookie Policy', href: '/cookies' },
        { text: 'GDPR', href: '/gdpr' },
      ],
    },
  ];

  return (
    <FooterContainer>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" gutterBottom>
              Aspire Match
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Connecting talent with opportunity. Your next career move starts here.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <SocialIcon>
                <FacebookIcon />
              </SocialIcon>
              <SocialIcon>
                <TwitterIcon />
              </SocialIcon>
              <SocialIcon>
                <LinkedInIcon />
              </SocialIcon>
              <SocialIcon>
                <InstagramIcon />
              </SocialIcon>
            </Box>
          </Grid>

          {footerSections.map((section, index) => (
            <Grid item xs={12} sm={4} md={2} key={index}>
              <Typography variant="h6" gutterBottom>
                {section.title}
              </Typography>
              {section.links.map((link, linkIndex) => (
                <FooterLink key={linkIndex} href={link.href}>
                  {link.text}
                </FooterLink>
              ))}
            </Grid>
          ))}

          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Email: support@aspirematch.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Phone: (123) 456-7890
            </Typography>
            <Typography variant="body2">
              Address: 123 Career Street, Job City
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Aspire Match. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FooterLink href="/sitemap">Sitemap</FooterLink>
            <FooterLink href="/accessibility">Accessibility</FooterLink>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;