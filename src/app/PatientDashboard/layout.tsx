"use client";
import { useState, useEffect } from "react";
import { styled, Container, Box } from "@mui/material";
import Loading from "@/app/PatientDashboard/loading"; 

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate API / data load
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainWrapper>
      <PageWrapper>
        <Container
          maxWidth={false}
          sx={{
            paddingTop: "20px",
            width: "100%",
            maxWidth: "100vw",
            margin: 0,
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          <Box
            sx={{
              minHeight: "calc(100vh - 170px)",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? <Loading /> : children}
          </Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
}
