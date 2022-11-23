import { createTheme } from "./components";

export const theme = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#28A745",
      },
      secondary: {
        main: "#EAF7ED",
      },
      text: {
        primary: "#444",
      },
    },
    typography: {
      fontWeightBold: 700,
      fontWeightMedium: 500,
      fontWeightLight: 400,
      fontWeightRegular: 400,
      fontFamily: "'DM Sans', sans-serif",
    },
    spacing: 10,
  });
  theme.typography = {
    ...theme.typography,
    body1: {
      ...theme.typography.body1,
      fontSize: 22,
      lineHeight: "30px",
      fontWeight: theme.typography.fontWeightLight,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 18,
        lineHeight: "23px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 16,
        lineHeight: "20px",
      },
    },
    body2: {
      ...theme.typography.body2,
      fontSize: 18,
      lineHeight: "23px",
      fontWeight: theme.typography.fontWeightLight,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 16,
        lineHeight: "20px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 14,
        lineHeight: "18px",
      },
    },
    button: {
      ...theme.typography.button,
      fontSize: 20,
      lineHeight: "30px",
      fontWeight: theme.typography.fontWeightLight,
      color: theme.palette.text.primary,
      textTransform: "capitalize",
      borderRadius: 5,
      border: `1px solid ${theme.palette.primary.main}`,
      [theme.breakpoints.down("md")]: {
        fontSize: 18,
        lineHeight: "23px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 16,
        lineHeight: "20px",
      },
    },
    h1: {
      ...theme.typography.h1,
      fontSize: 60,
      lineHeight: "65px",
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 48,
        lineHeight: "60px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 32,
        lineHeight: "42px",
      },
    },
    h2: {
      ...theme.typography.h2,
      fontSize: 48,
      lineHeight: "60px",
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 32,
        lineHeight: "42px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 26,
        lineHeight: "30px",
      },
    },
    h3: {
      ...theme.typography.h3,
      fontSize: 32,
      lineHeight: "42px",
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 26,
        lineHeight: "30px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 22,
        lineHeight: "26px",
      },
    },
    h4: {
      ...theme.typography.h4,
      fontSize: 26,
      lineHeight: "30px",
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 22,
        lineHeight: "26px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 18,
        lineHeight: "23px",
      },
    },
    h5: {
      ...theme.typography.h5,
      fontSize: 22,
      lineHeight: "26px",
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 18,
        lineHeight: "23px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 16,
        lineHeight: "20px",
      },
    },
    h6: {
      ...theme.typography.h6,
      fontSize: 18,
      lineHeight: "23px",
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.text.primary,
      [theme.breakpoints.down("md")]: {
        fontSize: 16,
        lineHeight: "20px",
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: 14,
        lineHeight: "18px",
      },
    },
  };
  theme.components = {
    MuiButton: {
      variants: [
        {
          props: { variant: "contained", color: "secondary" },
          style: ({ ownerState, theme }) => ({
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: "rgba(40, 167, 69, 0.2)",
            },
          }),
        },
        {
          props: { disabled: true },
          style: ({ ownerState, theme }) => ({
            borderColor: "rgba(0, 0, 0, 0.12)",
          }),
        },
      ],
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          height: "max-content",
          padding: "6px 30px",
        }),
      },
    },
    MuiLink: {
      variants: [
        {
          props: { hyperlink: "true" },
          style: ({ ownerState, theme }) => ({
            color: theme.palette.primary.main,
            "&:hover": {
              color: theme.palette.primary.main,
            },
          }),
        },
      ],
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          cursor: "pointer",
          color: theme.palette.text.primary,
          "&:hover": {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiTypography: {
      variants: [
        {
          props: {
            highlight: "true",
          },
          style: {
            "&>span": {
              color: theme.palette.primary.main,
            },
          },
        },
        {
          props: {
            firstLetterCapital: "true", // First letter capital
          },
          style: {
            "&::first-letter": {
              textTransform: "uppercase",
            },
          },
        },
      ],
    },
    MuiSelect: {
      variants: [
        {
          props: { variant: "standard" },
          style: ({ ownerState, theme }) => ({
            border: `2px solid ${theme.palette.primary.main}`,
            height: "max-content",
            borderRadius: 5,
          }),
        },
      ],
      styleOverrides: {
        select: ({ ownerState, theme }) => ({
          padding: "8px 15px ",
          minHeight: "unset",
          "&>p": {
            textTransform: "capitalize",
          },
          "&:focus": {
            backgroundColor: "transparent",
          },
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          "&>p": {
            textTransform: "capitalize",
          },
          "&:hover": {
            "&>p": {
              color: theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          minWidth: "unset",
        }),
      },
    },
    MuiTextField: {
      variants: [
        {
          props: { variant: "standard" },
          style: ({ ownerState, theme }) => ({
            "&>div": {
              border: `2px solid ${theme.palette.primary.main}`,
            },
          }),
        },
      ],
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          width: "100%",
          "&>div": {
            padding: "8px 15px",
            borderRadius: 5,
            "&>input": {
              padding: 0,
              fontSize: 18,
              lineHeight: "23px",
              fontWeight: theme.typography.fontWeightLight,
              color: theme.palette.text.primary,
            },
          },
        }),
      },
    },
  };
  return theme;
};

export default theme;
