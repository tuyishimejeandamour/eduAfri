-- Insert languages
INSERT INTO public.languages (code, name)
VALUES 
  ('en', 'English'),
  ('fr', 'French'),
  ('sw', 'Swahili'),
  ('am', 'Amharic'),
  ('ha', 'Hausa'),
  ('yo', 'Yoruba')
ON CONFLICT (code) DO NOTHING;

-- Insert sample courses
INSERT INTO public.content (id, title, description, type, language, subject, grade_level)
VALUES 
  ('b79cb3ba-745e-5d9a-8903-4a02327a7e09', 'Introduction to Mathematics', 'A comprehensive introduction to basic mathematical concepts', 'course', 'en', 'Mathematics', '5'),
  ('fb3463a0-7d6e-54a3-bcd8-1b93388c648d', 'Basic Science', 'Learn about the natural world and scientific principles', 'course', 'en', 'Science', '6'),
  ('efe7eedd-89c5-56f5-984c-0712ee41a2eb', 'African History', 'Explore the rich history of the African continent', 'course', 'en', 'History', '7')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons for Mathematics course
INSERT INTO public.content (title, description, type, language, course_id, order_in_course, content_html)
VALUES 
  ('Numbers and Counting', 'Learn about numbers and basic counting techniques', 'lesson', 'en', 'b79cb3ba-745e-5d9a-8903-4a02327a7e09', 1, '<h1>Numbers and Counting</h1><p>In this lesson, we will learn about numbers and how to count.</p><h2>What are Numbers?</h2><p>Numbers are symbols used to count and measure. The most common numbers are:</p><ul><li>0, 1, 2, 3, 4, 5, 6, 7, 8, 9</li></ul><p>These digits can be combined to form larger numbers.</p>'),
  ('Addition and Subtraction', 'Master the basics of adding and subtracting numbers', 'lesson', 'en', 'b79cb3ba-745e-5d9a-8903-4a02327a7e09', 2, '<h1>Addition and Subtraction</h1><p>In this lesson, we will learn how to add and subtract numbers.</p><h2>Addition</h2><p>Addition is the process of combining two or more numbers. The symbol for addition is "+".</p><p>Example: 2 + 3 = 5</p><h2>Subtraction</h2><p>Subtraction is the process of taking one number away from another. The symbol for subtraction is "-".</p><p>Example: 5 - 2 = 3</p>'),
  ('Multiplication and Division', 'Learn how to multiply and divide numbers', 'lesson', 'en', 'b79cb3ba-745e-5d9a-8903-4a02327a7e09', 3, '<h1>Multiplication and Division</h1><p>In this lesson, we will learn how to multiply and divide numbers.</p><h2>Multiplication</h2><p>Multiplication is a way of adding a number to itself multiple times. The symbol for multiplication is "*" or "*".</p><p>Example: 3 * 4 = 12</p><h2>Division</h2><p>Division is the process of splitting a number into equal parts. The symbol for division is "÷" or "/".</p><p>Example: 12 ÷ 4 = 3</p>')
ON CONFLICT DO NOTHING;

-- Insert sample lessons for Science course
INSERT INTO public.content (title, description, type, language, course_id, order_in_course, content_html)
VALUES 
  ('Introduction to Plants', 'Learn about the basic structure and function of plants', 'lesson', 'en', 'fb3463a0-7d6e-54a3-bcd8-1b93388c648d', 1, '<h1>Introduction to Plants</h1><p>In this lesson, we will learn about plants and their importance.</p><h2>What are Plants?</h2><p>Plants are living organisms that belong to the kingdom Plantae. They are typically characterized by their ability to produce their own food through photosynthesis.</p><h2>Parts of a Plant</h2><p>Most plants have the following parts:</p><ul><li>Roots: Absorb water and nutrients from the soil</li><li>Stem: Supports the plant and transports water and nutrients</li><li>Leaves: Where photosynthesis occurs</li><li>Flowers: Reproductive organs of the plant</li></ul>'),
  ('Animal Kingdom', 'Explore the diversity of animals and their characteristics', 'lesson', 'en', 'fb3463a0-7d6e-54a3-bcd8-1b93388c648d', 2, '<h1>Animal Kingdom</h1><p>In this lesson, we will learn about animals and their diversity.</p><h2>What are Animals?</h2><p>Animals are multicellular organisms that belong to the kingdom Animalia. Unlike plants, animals cannot produce their own food and must consume other organisms for energy.</p><h2>Classification of Animals</h2><p>Animals are classified into several groups:</p><ul><li>Mammals: Warm-blooded animals that give birth to live young</li><li>Birds: Warm-blooded animals with feathers</li><li>Reptiles: Cold-blooded animals with scales</li><li>Amphibians: Animals that live both in water and on land</li><li>Fish: Aquatic animals with gills</li><li>Insects: Animals with six legs and three body parts</li></ul>'),
  ('Weather and Climate', 'Understand the difference between weather and climate', 'lesson', 'en', 'fb3463a0-7d6e-54a3-bcd8-1b93388c648d', 3, '<h1>Weather and Climate</h1><p>In this lesson, we will learn about weather and climate.</p><h2>What is Weather?</h2><p>Weather refers to the state of the atmosphere at a specific time and place. It includes factors such as temperature, humidity, precipitation, wind, and cloud cover.</p><h2>What is Climate?</h2><p>Climate refers to the average weather conditions in a region over a long period of time, typically 30 years or more. Climate is what you expect, weather is what you get.</p><h2>Climate Zones</h2><p>The Earth has several climate zones:</p><ul><li>Tropical: Hot and humid year-round</li><li>Temperate: Four distinct seasons</li><li>Polar: Cold year-round</li><li>Desert: Hot and dry</li><li>Mediterranean: Mild, wet winters and hot, dry summers</li></ul>')
ON CONFLICT DO NOTHING;

-- Insert sample quiz for Mathematics
INSERT INTO public.content (id, title, description, type, language, course_id)
VALUES 
  ('c40b683b-ac7b-5d6b-b0eb-549cb20169b9', 'Basic Math Quiz', 'Test your knowledge of basic mathematical concepts', 'quiz', 'en', 'b79cb3ba-745e-5d9a-8903-4a02327a7e09')
ON CONFLICT (id) DO NOTHING;

-- Insert questions for the math quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation)
VALUES 
  ('c40b683b-ac7b-5d6b-b0eb-549cb20169b9', 'What is 5 + 7?', '["10", "11", "12", "13"]', 2, 'The sum of 5 and 7 is 12.'),
  ('c40b683b-ac7b-5d6b-b0eb-549cb20169b9', 'What is 20 - 8?', '["10", "12", "14", "16"]', 1, 'The difference between 20 and 8 is 12.'),
  ('c40b683b-ac7b-5d6b-b0eb-549cb20169b9', 'What is 4 × 6?', '["18", "20", "22", "24"]', 3, 'The product of 4 and 6 is 24.'),
  ('c40b683b-ac7b-5d6b-b0eb-549cb20169b9', 'What is 15 ÷ 3?', '["3", "4", "5", "6"]', 2, 'The quotient of 15 divided by 3 is 5.')
ON CONFLICT DO NOTHING;

-- Insert sample quiz for Science
INSERT INTO public.content (id, title, description, type, language, course_id)
VALUES 
  ('440c0655-0bf6-51b6-a1fa-527f475a6fbc', 'Science Knowledge Quiz', 'Test your understanding of basic science concepts', 'quiz', 'en', 'fb3463a0-7d6e-54a3-bcd8-1b93388c648d')
ON CONFLICT (id) DO NOTHING;

-- Insert questions for the science quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation)
VALUES 
  ('440c0655-0bf6-51b6-a1fa-527f475a6fbc', 'What do plants need to make their own food?', '["Water only", "Sunlight only", "Sunlight, water, and carbon dioxide", "Soil only"]', 2, 'Plants use sunlight, water, and carbon dioxide in a process called photosynthesis to make their own food.'),
  ('440c0655-0bf6-51b6-a1fa-527f475a6fbc', 'Which of the following is NOT a mammal?', '["Dolphin", "Bat", "Snake", "Elephant"]', 2, 'Snakes are reptiles, not mammals. Mammals are characterized by having hair, giving birth to live young, and producing milk.'),
  ('440c0655-0bf6-51b6-a1fa-527f475a6fbc', 'What causes day and night on Earth?', '["The Earth orbiting the Sun", "The Earth rotating on its axis", "The Moon blocking the Sun", "The Sun moving around the Earth"]', 1, 'Day and night are caused by the Earth rotating on its axis. As the Earth rotates, different parts of it face the Sun, experiencing day, while the parts facing away from the Sun experience night.'),
  ('440c0655-0bf6-51b6-a1fa-527f475a6fbc', 'What is the main function of the lungs?', '["Pump blood", "Filter waste", "Exchange gases", "Digest food"]', 2, 'The main function of the lungs is to exchange gases, specifically to bring oxygen into the body and remove carbon dioxide.')
ON CONFLICT DO NOTHING;

