import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { CopyrightProps } from "./Copyright.types";

export default function Copyright({
  websiteName,
  websiteUrl,
  ...props
}: CopyrightProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href={websiteUrl}>
        {websiteName}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
