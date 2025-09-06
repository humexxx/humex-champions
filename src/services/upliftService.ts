import { CALLABLE_FUNCTIONS } from '@shared/consts';
import {
  EPathwayCategory,
  ETodoCategory,
  IDailyStats,
  IOverallStats,
  IPathway,
  IPathwayTemplate,
  ITodoItem,
  ITodoList,
} from '@shared/types/uplift';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import useAuth from 'src/context/hooks/useAuth';
import { firestore as db, functions } from 'src/firebase';

class UpliftService {
  private uid: string;

  constructor(uid: string) {
    this.uid = uid;
  }

  // ================ STATISTICS ================
  async getDailyStats(date?: Date): Promise<IDailyStats> {
    const getDailyStats = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.uplift.getDailyStats
    );
    const result = await getDailyStats({ date: date?.toISOString() });
    return (result.data as any).data;
  }

  async getOverallStats(): Promise<IOverallStats> {
    const getOverallStats = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.uplift.getOverallStats
    );
    const result = await getOverallStats({});
    return (result.data as any).data;
  }

  // ================ TODO LISTS ================
  async getTodoList(date: Date): Promise<ITodoList | null> {
    const dateStr = this.formatDate(date);
    const todoRef = doc(db, 'uplift', this.uid, 'checklist', dateStr);
    const todoDoc = await getDoc(todoRef);

    if (!todoDoc.exists()) {
      return null;
    }

    const data = todoDoc.data();
    return {
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as ITodoList;
  }

  async createTodoList(
    date: Date,
    items: Omit<ITodoItem, 'id' | 'createdAt'>[] = []
  ): Promise<ITodoList> {
    const dateStr = this.formatDate(date);
    const now = new Date();

    const todoItems: ITodoItem[] = items.map((item) => ({
      ...item,
      id: this.generateId(),
      createdAt: now,
    }));

    const todoList: Omit<ITodoList<Timestamp>, 'id'> = {
      date: Timestamp.fromDate(date),
      items: todoItems,
      completionPercentage: 0,
      totalItems: todoItems.length,
      completedItems: 0,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const todoRef = doc(db, 'uplift', this.uid, 'checklist', dateStr);
    await updateDoc(todoRef, todoList as any);

    return {
      id: dateStr,
      ...todoList,
      date: date,
      createdAt: now,
      updatedAt: now,
    } as ITodoList;
  }

  async updateTodoList(date: Date, updates: Partial<ITodoList>): Promise<void> {
    const dateStr = this.formatDate(date);
    const todoRef = doc(db, 'uplift', this.uid, 'checklist', dateStr);

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(todoRef, updateData);
  }

  async addTodoItem(
    date: Date,
    item: Omit<ITodoItem, 'id' | 'createdAt'>
  ): Promise<void> {
    const todoList = await this.getTodoList(date);
    const newItem: ITodoItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
    };

    const updatedItems = todoList ? [...todoList.items, newItem] : [newItem];
    const completedItems = updatedItems.filter((i) => i.completed).length;

    await this.updateTodoList(date, {
      items: updatedItems,
      totalItems: updatedItems.length,
      completedItems,
      completionPercentage:
        updatedItems.length > 0
          ? (completedItems / updatedItems.length) * 100
          : 0,
    });
  }

  async updateTodoItem(
    date: Date,
    itemId: string,
    updates: Partial<ITodoItem>
  ): Promise<void> {
    const todoList = await this.getTodoList(date);
    if (!todoList) return;

    const updatedItems = todoList.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const completedItems = updatedItems.filter((i) => i.completed).length;

    await this.updateTodoList(date, {
      items: updatedItems,
      completedItems,
      completionPercentage:
        updatedItems.length > 0
          ? (completedItems / updatedItems.length) * 100
          : 0,
    });
  }

  async deleteTodoItem(date: Date, itemId: string): Promise<void> {
    const todoList = await this.getTodoList(date);
    if (!todoList) return;

    const updatedItems = todoList.items.filter((item) => item.id !== itemId);
    const completedItems = updatedItems.filter((i) => i.completed).length;

    await this.updateTodoList(date, {
      items: updatedItems,
      totalItems: updatedItems.length,
      completedItems,
      completionPercentage:
        updatedItems.length > 0
          ? (completedItems / updatedItems.length) * 100
          : 0,
    });
  }

  // ================ PATHWAYS ================
  async getPathways(): Promise<IPathway[]> {
    const pathwaysRef = collection(db, 'uplift', this.uid, 'pathways');
    const q = query(pathwaysRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        }) as IPathway
    );
  }

  async getPathway(pathwayId: string): Promise<IPathway | null> {
    const pathwayRef = doc(db, 'uplift', this.uid, 'pathways', pathwayId);
    const pathwayDoc = await getDoc(pathwayRef);

    if (!pathwayDoc.exists()) {
      return null;
    }

    const data = pathwayDoc.data();
    return {
      id: pathwayDoc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as IPathway;
  }

  async createPathway(
    pathway: Omit<IPathway, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const now = new Date();
    const pathwayData = {
      ...pathway,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const pathwaysRef = collection(db, 'uplift', this.uid, 'pathways');
    const docRef = await addDoc(pathwaysRef, pathwayData);
    return docRef.id;
  }

  async updatePathway(
    pathwayId: string,
    updates: Partial<IPathway>
  ): Promise<void> {
    const pathwayRef = doc(db, 'uplift', this.uid, 'pathways', pathwayId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await updateDoc(pathwayRef, updateData as any);
  }

  async deletePathway(pathwayId: string): Promise<void> {
    const pathwayRef = doc(db, 'uplift', this.uid, 'pathways', pathwayId);
    await deleteDoc(pathwayRef);
  }

  // ================ PATHWAY TEMPLATES ================
  getPathwayTemplates(): IPathwayTemplate[] {
    return [
      {
        id: 'fitness-beginner',
        title: '30-Day Fitness Foundation',
        description:
          'Build a solid fitness foundation with daily exercise habits',
        category: EPathwayCategory.FITNESS,
        color: '#4CAF50',
        icon: 'FitnessCenter',
        difficulty: 'BEGINNER' as any,
        estimatedDuration: 30,
        goals: [
          {
            title: 'Daily Exercise',
            description: 'Complete 30 minutes of physical activity',
            targetValue: 30,
            unit: 'minutes',
            frequency: 'DAILY' as any,
            milestones: [
              {
                id: '1',
                title: 'First Week',
                targetValue: 7,
                isCompleted: false,
              },
              {
                id: '2',
                title: 'Half Way',
                targetValue: 15,
                isCompleted: false,
              },
              {
                id: '3',
                title: 'Final Week',
                targetValue: 30,
                isCompleted: false,
              },
            ],
            startDate: new Date(),
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            autoGenerateTodos: true,
            todoTemplate: {
              title: 'Complete Daily Workout',
              description: 'Do 30 minutes of exercise',
              defaultDuration: 30,
              priority: 'MEDIUM' as any,
              category: ETodoCategory.FITNESS,
              labels: ['fitness', 'daily'],
            },
          },
        ],
      },
      {
        id: 'meditation-mindfulness',
        title: 'Mindfulness Journey',
        description: 'Develop daily meditation and mindfulness practices',
        category: EPathwayCategory.MINDFULNESS,
        color: '#9C27B0',
        icon: 'SelfImprovement',
        difficulty: 'BEGINNER' as any,
        estimatedDuration: 21,
        goals: [
          {
            title: 'Daily Meditation',
            description: 'Practice mindfulness meditation',
            targetValue: 10,
            unit: 'minutes',
            frequency: 'DAILY' as any,
            milestones: [
              {
                id: '1',
                title: 'First Week',
                targetValue: 7,
                isCompleted: false,
              },
              {
                id: '2',
                title: 'Second Week',
                targetValue: 14,
                isCompleted: false,
              },
              {
                id: '3',
                title: 'Third Week',
                targetValue: 21,
                isCompleted: false,
              },
            ],
            startDate: new Date(),
            targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            autoGenerateTodos: true,
            todoTemplate: {
              title: 'Morning Meditation',
              description: 'Practice 10 minutes of mindfulness',
              defaultDuration: 10,
              priority: 'HIGH' as any,
              category: ETodoCategory.MEDITATION,
              labels: ['meditation', 'mindfulness'],
            },
          },
        ],
      },
      {
        id: 'healthy-eating',
        title: 'Nutrition Transformation',
        description: 'Build healthy eating habits and meal planning skills',
        category: EPathwayCategory.NUTRITION,
        color: '#FF9800',
        icon: 'Restaurant',
        difficulty: 'INTERMEDIATE' as any,
        estimatedDuration: 60,
        goals: [
          {
            title: 'Meal Planning',
            description: 'Plan healthy meals in advance',
            targetValue: 1,
            unit: 'plan',
            frequency: 'WEEKLY' as any,
            milestones: [
              {
                id: '1',
                title: 'First Month',
                targetValue: 4,
                isCompleted: false,
              },
              {
                id: '2',
                title: 'Second Month',
                targetValue: 8,
                isCompleted: false,
              },
            ],
            startDate: new Date(),
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            autoGenerateTodos: true,
            todoTemplate: {
              title: 'Plan Weekly Meals',
              description: 'Create a healthy meal plan for the week',
              defaultDuration: 30,
              priority: 'MEDIUM' as any,
              category: ETodoCategory.NUTRITION,
              labels: ['nutrition', 'planning'],
            },
          },
        ],
      },
    ];
  }

  // ================ HELPER METHODS ================
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Hook to get uplift service instance
export const useUpliftService = () => {
  const { currentUser } = useAuth();

  if (!currentUser?.uid) {
    throw new Error('User must be authenticated to use UpliftService');
  }

  return new UpliftService(currentUser.uid);
};

export default UpliftService;
