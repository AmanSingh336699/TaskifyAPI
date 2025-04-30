import 'dotenv/config';
import { connectDb, closeMongoDB } from '../config/connectDb.js';
import User from '../models/user.model.js';
import Todo from '../models/todo.model.js';
import Post from '../models/post.models.js';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const clearData = async (shouldClear) => {
  if (shouldClear) {
    await User.deleteMany({});
    await Todo.deleteMany({});
    await Post.deleteMany({});
  }
};

const generateStrongPassword = async () => {
  const password = crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

const generateUsers = async (count, adminEmail, adminPassword) => {
  const users = [];

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const admin = new User({
      name: 'Admin User',
      email: adminEmail,
      password: hashedAdminPassword,
      isVerified: true,
      role: 'admin',
    });
    users.push(admin);
  }

  for (let i = 1; i < count; i++) {
    const password = await generateStrongPassword();
    const user = new User({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: password,
      isVerified: Math.random() > 0.2,
      role: 'user',
    });
    users.push(user);
  }

  await User.insertMany(users, { ordered: false });

  return users;
};

const generateTodos = async (users, todosPerUser) => {
  const todos = [];
  const statuses = ['pending', 'in-progress', 'completed'];
  const priorities = ['low', 'medium', 'high'];
  const tags = ['work', 'personal', 'urgent', 'important'];

  for (const user of users) {
    for (let i = 0; i < todosPerUser; i++) {
      const todo = new Todo({
        userId: user._id,
        title: faker.lorem.sentence({ min: 3, max: 5 }),
        description: faker.lorem.paragraph(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate: faker.date.future(),
        tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
          tags[Math.floor(Math.random() * tags.length)]
        ),
      });
      todos.push(todo);
    }
  }

  await Todo.insertMany(todos, { ordered: false });

  return todos;
};

const generatePosts = async (users, postsPerUser) => {
  const posts = [];

  for (const user of users) {
    for (let i = 0; i < postsPerUser; i++) {
      const post = new Post({
        userId: user._id,
        title: faker.lorem.sentence({ min: 5, max: 10 }),
        content: faker.lorem.paragraphs(3),
      });
      posts.push(post);
    }
  }

  await Post.insertMany(posts, { ordered: false });

  return posts;
};

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SEED_PRODUCTION) {
      process.exit(1);
    }

    await connectDb();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || generateStrongPassword();
    const userCount = parseInt(process.env.USER_COUNT) || 100;
    const todosPerUser = parseInt(process.env.TODOS_PER_USER) || 10;
    const postsPerUser = parseInt(process.env.POSTS_PER_USER) || 5;
    const clearExistingData = process.env.CLEAR_DATA === 'true';

    await clearData(clearExistingData);

    const users = await generateUsers(userCount, adminEmail, adminPassword);
    const todos = await generateTodos(users, todosPerUser);
    const posts = await generatePosts(users, postsPerUser);

    await closeMongoDB();
    process.exit(0);
  } catch (error) {
    await closeMongoDB();
    process.exit(1);
  }
};

seedDatabase();
