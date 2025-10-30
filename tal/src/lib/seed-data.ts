import { faker } from '@faker-js/faker';
import { db, Job, Candidate, Assessment } from './db';

export async function seedDatabase(force = false) {
  // When force is true (useful for local development), clear existing data
  if (force) {
    console.log('Force reseed: clearing existing database...');
    await db.jobs.clear();
    await db.candidates.clear();
    await db.assessments.clear();
    await db.timelines.clear();
    await db.assessmentResponses.clear();
  }

  const existingJobs = await db.jobs.count();
  if (existingJobs > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Seed 20 mostly IT jobs
  const itJobTitles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Cloud Architect',
    'Site Reliability Engineer',
    'Business Intelligence Analyst',
    'Systems Engineer',
    'Data Analyst',
    'UI/UX Designer',
    'Mobile App Developer',
    'QA Engineer',
    'Security Engineer',
    'Database Administrator',
    'Network Engineer',
    'Embedded Systems Developer',
    'Systems Administrator',
    'Product Engineer',
    'Technical Support Engineer',
  ];

  const techTags = [
    ['React', 'TypeScript', 'Node.js'],
    ['React', 'JavaScript', 'CSS'],
    ['Node.js', 'Python', 'SQL'],
    ['React', 'Node.js', 'AWS'],
    ['Docker', 'Kubernetes', 'AWS'],
    ['AWS', 'Azure', 'GCP'],
    ['Kubernetes', 'Monitoring', 'Linux'],
    ['Python', 'SQL', 'Power BI'],
    ['Python', 'Java', 'SQL'],
    ['SQL', 'Python', 'Tableau'],
    ['Figma', 'Sketch', 'UX'],
    ['React Native', 'Swift', 'Kotlin'],
    ['Selenium', 'Jest', 'Cypress'],
    ['Security', 'Penetration Testing', 'Compliance'],
    ['SQL', 'PostgreSQL', 'MongoDB'],
    ['Networking', 'Cisco', 'Security'],
    ['C', 'C++', 'Embedded'],
    ['Linux', 'Windows Server', 'Scripting'],
    ['Agile', 'Product Management', 'Technical'],
    ['Customer Support', 'Troubleshooting', 'Documentation'],
  ];

  const jobs: Job[] = [];
  for (let i = 0; i < 20; i++) {
    const title = itJobTitles[i];
    const job: Job = {
      id: `job-${i + 1}`,
      title,
      slug: faker.helpers.slugify(title).toLowerCase(),
      description: faker.lorem.paragraphs(2),
      status: faker.helpers.arrayElement(['active', 'active', 'active', 'archived']),
      tags: techTags[i] || faker.helpers.arrayElements(
        ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'TypeScript'],
        { min: 1, max: 3 }
      ),
      order: i,
      createdAt: faker.date.past().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    jobs.push(job);
  }
  await db.jobs.bulkAdd(jobs);

  // Seed 1000 candidates
  const candidates: Candidate[] = [];
  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'] as const;
  
  for (let i = 0; i < 1000; i++) {
    const candidate: Candidate = {
      id: `candidate-${i + 1}`,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      stage: faker.helpers.arrayElement(stages),
      jobId: `job-${faker.number.int({ min: 1, max: 20 })}`,
      tags: faker.helpers.arrayElements(
        ['Frontend', 'Backend', 'Fullstack', 'Senior', 'Junior', 'Mid-level', 'Remote', 'Relocate'],
        { min: 0, max: 3 }
      ),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    candidates.push(candidate);
  }
  await db.candidates.bulkAdd(candidates);

  // Seed 3 sample assessments
  const assessments: Assessment[] = [];
  for (let i = 0; i < 3; i++) {
    const assessment: Assessment = {
      id: `assessment-${i + 1}`,
      jobId: `job-${i + 1}`,
      title: `${jobs[i].title} Assessment`,
      sections: [
        {
          id: `section-1-${i}`,
          title: 'Personal Information',
          questions: [
            {
              id: `q1-${i}`,
              type: 'text',
              question: 'What is your full name?',
              required: true,
              maxLength: 100,
            },
            {
              id: `q2-${i}`,
              type: 'text',
              question: 'What is your email address?',
              required: true,
              maxLength: 255,
            },
          ],
        },
        {
          id: `section-2-${i}`,
          title: 'Experience',
          questions: [
            {
              id: `q3-${i}`,
              type: 'numeric',
              question: 'How many years of experience do you have?',
              required: true,
              minValue: 0,
              maxValue: 50,
            },
            {
              id: `q4-${i}`,
              type: 'single',
              question: 'Are you open to relocation?',
              required: true,
              options: ['Yes', 'No', 'Maybe'],
            },
            {
              id: `q5-${i}`,
              type: 'multi',
              question: 'Which technologies are you proficient in?',
              required: false,
              options: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go'],
            },
            {
              id: `q6-${i}`,
              type: 'longtext',
              question: 'Describe your most challenging project.',
              required: true,
              maxLength: 1000,
            },
          ],
        },
        {
          id: `section-3-${i}`,
          title: 'Additional Information',
          questions: [
            {
              id: `q7-${i}`,
              type: 'single',
              question: 'Do you have a portfolio?',
              required: true,
              options: ['Yes', 'No'],
            },
            {
              id: `q8-${i}`,
              type: 'text',
              question: 'If yes, please provide the URL',
              required: false,
              maxLength: 500,
              conditionalLogic: {
                dependsOn: `q7-${i}`,
                expectedValue: 'Yes',
              },
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assessments.push(assessment);
  }
  await db.assessments.bulkAdd(assessments);

  console.log('Database seeded successfully!');
}
