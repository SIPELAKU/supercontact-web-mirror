"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import LinearProgress from "@mui/material/LinearProgress";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function ActivitySidebar() {
  const [contentType, setContentType] = useState("All Content");

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="rounded-2xl! shadow-lg!">
        <CardContent className="p-4!">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <Typography className="text-sm! font-semibold!">Filters</Typography>
          </div>

          <Divider className="my-3!" />

          <Typography className="text-[10px]! font-semibold! tracking-widest! text-slate-400! uppercase!">
            channel
          </Typography>

          <div className="mt-2 flex flex-col">
            <FormControlLabel
              className="m-0"
              control={<Checkbox defaultChecked size="small" />}
              label={
                <span className="text-xs text-slate-700">LinkedIn</span>
              }
            />
            <FormControlLabel
              className="m-0"
              control={<Checkbox defaultChecked size="small" />}
              label={<span className="text-xs text-slate-700">X (Twitter)</span>}
            />
            <FormControlLabel
              className="m-0"
              control={<Checkbox defaultChecked size="small" />}
              label={<span className="text-xs text-slate-700">Instagram</span>}
            />
            <FormControlLabel
              className="m-0"
              control={<Checkbox defaultChecked size="small" />}
              label={
                <span className="text-xs text-slate-700">Website Changes</span>
              }
            />
            <FormControlLabel
              className="m-0"
              control={<Checkbox size="small" />}
              label={<span className="text-xs text-slate-700">News Mentions</span>}
            />
          </div>

          <Divider className="my-3!" />

          <Typography className="text-[10px]! font-semibold! tracking-widest! text-slate-400!">
            CONTENT TYPE
          </Typography>

          <FormControl size="small" className="mt-2 w-full">
            <Select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              sx={{
                borderRadius: "10px",
                height: 36,
                fontSize: 12,
                "& .MuiSelect-select": { py: 1 },
              }}
            >
              <MenuItem value="All Content">All Content</MenuItem>
              <MenuItem value="Posts">Posts</MenuItem>
              <MenuItem value="Articles">Articles</MenuItem>
              <MenuItem value="Updates">Updates</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Volume by Channel */}
      <Card className="rounded-2xl! shadow-lg!">
        <CardContent className="p-4!">
          <div className="flex items-center justify-between">
            <Typography className="text-sm! font-semibold!">
              Volume by Channel
            </Typography>
            <Typography className="text-xs! text-slate-400!">68%</Typography>
          </div>

          <div className="mt-4 space-y-4">
            {/* LinkedIn */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Typography className="text-xs! font-medium! text-slate-700">
                  LinkedIn
                </Typography>
                <Typography className="text-[11px]! text-slate-400!">
                  68%
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={68}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#EEF2FF",
                  "& .MuiLinearProgress-bar": { borderRadius: 999 },
                }}
              />
            </div>

            {/* X */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Typography className="text-xs! font-medium! text-slate-700">
                  X (Twitter)
                </Typography>
                <Typography className="text-[11px]! text-slate-400!">
                  20%
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={20}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#EEF2FF",
                  "& .MuiLinearProgress-bar": { borderRadius: 999 },
                }}
              />
            </div>

            {/* Website */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Typography className="text-xs! font-medium! text-slate-700">
                  Website
                </Typography>
                <Typography className="text-[11px]! text-slate-400!">
                  12%
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={12}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#EEF2FF",
                  "& .MuiLinearProgress-bar": { borderRadius: 999 },
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="rounded-2xl! shadow-lg!">
        <CardContent className="p-4!">
          <Typography className="text-sm! font-semibold!">
            Trending Topics
          </Typography>

          <div className="mt-3 flex flex-wrap gap-2">
            {["#AI", "#SeriesB", "Sustainability", "Remote Work", "Webinar"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
