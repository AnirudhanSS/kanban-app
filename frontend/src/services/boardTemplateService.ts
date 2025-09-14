export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  columns: {
    title: string;
    position: number;
  }[];
  cards?: {
    title: string;
    description: string;
    columnTitle: string;
    priority?: string;
  }[];
}

export const boardTemplates: BoardTemplate[] = [
  {
    id: 'basic-kanban',
    name: 'Basic Kanban',
    description: 'Simple Todo, In Progress, Done workflow',
    columns: [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 }
    ]
  },
  {
    id: 'simple-todo',
    name: 'Simple Todo',
    description: 'Basic task management with just two columns',
    columns: [
      { title: 'To Do', position: 0 },
      { title: 'Completed', position: 1 }
    ]
  },
  {
    id: 'software-development',
    name: 'Software Development',
    description: 'Complete software development workflow',
    columns: [
      { title: 'Backlog', position: 0 },
      { title: 'To Do', position: 1 },
      { title: 'In Progress', position: 2 },
      { title: 'Code Review', position: 3 },
      { title: 'Testing', position: 4 },
      { title: 'Done', position: 5 }
    ],
    cards: [
      {
        title: 'Setup development environment',
        description: 'Install and configure all necessary tools and dependencies',
        columnTitle: 'To Do',
        priority: 'high'
      },
      {
        title: 'Create project structure',
        description: 'Set up folder structure and basic configuration files',
        columnTitle: 'To Do',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'Content planning and creation workflow',
    columns: [
      { title: 'Ideas', position: 0 },
      { title: 'Research', position: 1 },
      { title: 'Writing', position: 2 },
      { title: 'Review', position: 3 },
      { title: 'Published', position: 4 }
    ],
    cards: [
      {
        title: 'Research trending topics',
        description: 'Find current trends and popular topics in the industry',
        columnTitle: 'Research',
        priority: 'high'
      }
    ]
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Complete event planning and execution workflow',
    columns: [
      { title: 'Planning', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Review', position: 2 },
      { title: 'Ready', position: 3 },
      { title: 'Completed', position: 4 }
    ],
    cards: [
      {
        title: 'Book venue',
        description: 'Find and book appropriate venue for the event',
        columnTitle: 'Planning',
        priority: 'high'
      },
      {
        title: 'Send invitations',
        description: 'Create and send invitations to all attendees',
        columnTitle: 'Planning',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'bug-tracking',
    name: 'Bug Tracking',
    description: 'Bug reporting and resolution workflow',
    columns: [
      { title: 'Reported', position: 0 },
      { title: 'Confirmed', position: 1 },
      { title: 'In Progress', position: 2 },
      { title: 'Testing', position: 3 },
      { title: 'Resolved', position: 4 }
    ],
    cards: [
      {
        title: 'Login page not loading',
        description: 'Users cannot access the login page on mobile devices',
        columnTitle: 'Reported',
        priority: 'high'
      }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Complete marketing campaign workflow',
    columns: [
      { title: 'Ideas', position: 0 },
      { title: 'Planning', position: 1 },
      { title: 'In Progress', position: 2 },
      { title: 'Review', position: 3 },
      { title: 'Published', position: 4 }
    ],
    cards: [
      {
        title: 'Social media strategy',
        description: 'Develop comprehensive social media marketing strategy',
        columnTitle: 'Planning',
        priority: 'high'
      }
    ]
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Product development and feature planning',
    columns: [
      { title: 'Backlog', position: 0 },
      { title: 'Planned', position: 1 },
      { title: 'In Development', position: 2 },
      { title: 'Testing', position: 3 },
      { title: 'Released', position: 4 }
    ],
    cards: [
      {
        title: 'User authentication system',
        description: 'Implement secure user login and registration',
        columnTitle: 'Planned',
        priority: 'high'
      }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Customer support ticket management',
    columns: [
      { title: 'New Tickets', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Waiting for Customer', position: 2 },
      { title: 'Resolved', position: 3 }
    ],
    cards: [
      {
        title: 'Account access issue',
        description: 'Customer cannot log into their account',
        columnTitle: 'New Tickets',
        priority: 'high'
      }
    ]
  }
];

export const getTemplateById = (id: string): BoardTemplate | undefined => {
  return boardTemplates.find(template => template.id === id);
};

export const getAllTemplates = (): BoardTemplate[] => {
  return boardTemplates;
};

export const exportBoardAsTemplate = (board: any): BoardTemplate => {
  return {
    id: `custom-${Date.now()}`,
    name: `${board.title} Template`,
    description: `Template based on ${board.title} board`,
    columns: board.Columns?.map((col: any, index: number) => ({
      title: col.title,
      position: index
    })) || [],
    cards: board.Cards?.map((card: any) => ({
      title: card.title,
      description: card.description || '',
      columnTitle: board.Columns?.find((col: any) => col.id === card.column_id)?.title || '',
      priority: card.priority || 'medium'
    })) || []
  };
};

export const importTemplate = (template: BoardTemplate): any => {
  return {
    title: template.name,
    description: template.description,
    columns: template.columns,
    cards: template.cards || []
  };
};
