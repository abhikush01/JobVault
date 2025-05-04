import React from "react";
import { Header } from "../../components";
import { Footer } from "../../components";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SmartMatchingIcon from "@mui/icons-material/AutoGraph";
import RealTimeIcon from "@mui/icons-material/NotificationsActive";
import SecureIcon from "@mui/icons-material/Security";
import ReferralIcon from "@mui/icons-material/People";

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  padding: theme.spacing(15, 0),
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/pattern.png")',
    opacity: 0.1,
    zIndex: 1,
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  borderRadius: theme.shape.borderRadius * 2,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  width: 64,
  height: 64,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
}));

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const features = [
    {
      icon: <SmartMatchingIcon fontSize="large" />,
      title: "Smart Matching",
      description:
        "Our advanced algorithm matches you with the most relevant opportunities or candidates based on your profile and preferences.",
    },
    {
      icon: <RealTimeIcon fontSize="large" />,
      title: "Real-time Updates",
      description:
        "Stay informed with instant notifications about new opportunities, applications, and matches.",
    },
    {
      icon: <SecureIcon fontSize="large" />,
      title: "Secure Platform",
      description:
        "Your data is protected with industry-standard security measures and privacy controls.",
    },
    {
      icon: <ReferralIcon fontSize="large" />,
      title: "Referral Network",
      description:
        "Anyone can create referral posts to help others find opportunities, and job seekers can apply directly.",
    },
  ];

  return (
    <>
      <Header />
      <Box sx={{ flexGrow: 1 }}>
        <HeroSection>
          <Container maxWidth="lg">
            <Typography
              variant={isMobile ? "h2" : "h1"}
              gutterBottom
              sx={{ position: "relative", zIndex: 2 }}
            >
              Find Your Perfect Match
            </Typography>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                mb: 4,
                maxWidth: "800px",
                mx: "auto",
                position: "relative",
                zIndex: 2,
              }}
            >
              Connect with the right opportunities and talent. Whether you're
              looking for a job, searching for the perfect candidate, or want to
              help someone by creating a referral post.
            </Typography>
            <Box sx={{ mt: 4, position: "relative", zIndex: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href="/user"
                sx={{ mr: 2, mb: isMobile ? 2 : 0 }}
              >
                I'm a Job Seeker
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                href="/recruiter"
                sx={{ mr: 2, mb: isMobile ? 2 : 0 }}
              >
                I'm a Recruiter
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                href="/create-referral"
              >
                Create Referral Post
              </Button>
            </Box>
          </Container>
        </HeroSection>

        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>
            Why Choose Aspire Match?
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 4 },
              alignItems: "stretch",
            }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: "100%", sm: "25%" },
                  mb: { xs: 2, sm: 0 },
                }}
              >
                <FeatureCard sx={{ height: "100%" }}>
                  <CardContent
                    sx={{
                      textAlign: "center",
                      flexGrow: 1,
                      p: { xs: 2, sm: 3 },
                    }}
                  >
                    <IconWrapper
                      sx={{
                        width: { xs: 48, sm: 64 },
                        height: { xs: 48, sm: 64 },
                      }}
                    >
                      {feature.icon}
                    </IconWrapper>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default Home;
