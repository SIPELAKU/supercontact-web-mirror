import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CompanyAboutSkeleton from "./CompanyAboutSkeleton";

interface CompanyAboutProps {
  isLoading: boolean;
  companyName: string;
  description: string;
  tags: string[];
  yearsFounded: string;
  headquarters: string;
  employees: string;
  status: string;
}

export default function CompanyAbout({ isLoading, companyName, description, tags, yearsFounded, headquarters, employees, status }: CompanyAboutProps) {
  if (isLoading) return <CompanyAboutSkeleton />;

  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <Typography className="text-base! font-semibold!">About {companyName}</Typography>

        {/* Description */}
        <Typography className="mt-2 text-sm! leading-relaxed! text-gray-600!">{description}</Typography>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <Divider className="my-5!" />

        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="space-y-1">
            <Typography className="text-[10px]! font-semibold! tracking-widest! text-slate-400!">FOUNDED</Typography>
            <Typography className="text-sm! font-semibold! text-slate-900!">{yearsFounded}</Typography>
          </div>

          <div className="space-y-1">
            <Typography className="text-[10px]! font-semibold! tracking-widest! text-slate-400!">HEADQUARTERS</Typography>
            <Typography className="text-sm! font-semibold! text-slate-900!">{headquarters}</Typography>
          </div>

          <div className="space-y-1">
            <Typography className="text-[10px]! font-semibold! tracking-widest! text-slate-400!">EMPLOYEES</Typography>
            <Typography className="text-sm! font-semibold! text-slate-900!">{employees}</Typography>
          </div>

          <div className="space-y-1">
            <Typography className="text-[10px]! font-semibold! tracking-widest! text-slate-400!">STATUS</Typography>
            <Typography className="text-sm! font-semibold! text-slate-900!">{status}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
