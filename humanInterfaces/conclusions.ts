import { EventShape } from '../ldo/conclusions.typings'

export function displayEventShape(eventShape: EventShape): string {
    return "Do you agree to attend \"" + eventShape.description + "\" " +
        "from " + new Date(eventShape.startTime).toUTCString() + 
        " to " + new Date(eventShape.endTime).toUTCString();
}
