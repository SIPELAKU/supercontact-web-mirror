export function getDateRange(label: string) {
  const now = new Date();

  const format = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  let start: Date;
  let end: Date;

  const range = label.trim().toLowerCase().replace(/\s+/g, "_");

  switch (range) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;

    case "this_week": {
      const day = now.getDay();
      const monday = now.getDate() - day + (day === 0 ? -6 : 1);

      start = new Date(now.getFullYear(), now.getMonth(), monday);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }

    case "last_week": {
      const day = now.getDay();
      const mondayLastWeek = now.getDate() - day - 6;

      start = new Date(now.getFullYear(), now.getMonth(), mondayLastWeek);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }

    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;

    default:
      return null;
  }

  return {
    start: format(start),
    end: format(end),
  };
}
