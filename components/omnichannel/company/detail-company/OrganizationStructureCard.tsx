import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function OrganizationStructureCard() {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-0!">
        <div className="p-5">
          <Typography className="text-base! font-semibold!">Organization Structure</Typography>
        </div>

        <Divider />

        <div className="text-center p-5">
          <button className="text-xs font-medium text-[#5479EE] hover:underline cursor-pointer">View All Departments</button>
        </div>
      </CardContent>
    </Card>
  );
}
