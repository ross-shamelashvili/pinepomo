import { useCallback, useEffect, useState } from 'react';

export interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  section_id: string | null;
  parent_id: string | null;
  order: number;
  priority: number;
  due: {
    date: string;
    string: string;
    datetime?: string;
    timezone?: string;
    is_recurring: boolean;
  } | null;
  labels: string[];
  created_at: string;
  url: string;
}

interface UseTodoistReturn {
  tasks: TodoistTask[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isConnected: boolean;
}

const TODOIST_API_BASE = 'https://api.todoist.com/rest/v2';

export function useTodoist(apiKey: string | null): UseTodoistReturn {
  const [tasks, setTasks] = useState<TodoistTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!apiKey) {
      setTasks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${TODOIST_API_BASE}/tasks?filter=${encodeURIComponent('(today | overdue)')}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const data: TodoistTask[] = await response.json();

      // Sort by priority (higher = more important) then by due date
      const sortedTasks = data.sort((a, b) => {
        // Priority: 4 = urgent, 1 = normal
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Then by due date (overdue first)
        if (a.due?.date && b.due?.date) {
          return new Date(a.due.date).getTime() - new Date(b.due.date).getTime();
        }
        return 0;
      });

      setTasks(sortedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  // Fetch tasks when API key changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    isConnected: !!apiKey,
  };
}

// Post a comment to a Todoist task
export async function postTodoistComment(
  apiKey: string,
  taskId: string,
  content: string
): Promise<boolean> {
  try {
    const response = await fetch(`${TODOIST_API_BASE}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: taskId,
        content,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
