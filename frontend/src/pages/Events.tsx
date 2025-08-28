import EventStream from "../components/EventStream";
import { Card } from "../components/Card";

export default function Events(){
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Live Events</h1>
      <Card>
        <EventStream/>
      </Card>
    </div>
  );
}
