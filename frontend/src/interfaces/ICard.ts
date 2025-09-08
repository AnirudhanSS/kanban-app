import ICategory from "./ICategory";
import IStatus from "./IStatus";

interface ICard {
  id: string,
  column_id: string,
  title: string,
  description?: string,
  assignee_id?: string,
  reporter_id?: string,
  due_date?: string,
  priority?: 'low' | 'medium' | 'high' | 'urgent',
  position: number,
  estimated_hours?: number,
  actual_hours?: number,
  is_archived: boolean,
  version: number,
  created_at: string,
  updated_at: string,
  // Frontend specific fields
  category?: ICategory,
  status?: IStatus,
  hidden?: boolean
}

export default ICard;