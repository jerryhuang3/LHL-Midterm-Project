CREATE TABLE  users (
  id SERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(50) NOT NULL,
  full_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(32) NOT NULL,
  avatar VARCHAR(255) NOT NULL,
  create_date TIMESTAMPTZ
);

CREATE TABLE topics (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(50)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  text VARCHAR(500),
  create_date TIMESTAMPTZ
);

CREATE TABLE boards (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(50),
  create_date TIMESTAMPTZ
);

CREATE TABLE links (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  url VARCHAR(255),
  title VARCHAR(50),
  description VARCHAR(200),
  create_date TIMESTAMPTZ
);

CREATE TABLE boards_links (
  id SERIAL PRIMARY KEY NOT NULL,
  link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, link_id),
  rating INTEGER
);

CREATE TABLE learnt_counters (
   user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
   PRIMARY KEY (user_id, link_id),
   learnt INTEGER DEFAULT 0
);
