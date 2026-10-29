USE krishimap;

CREATE TABLE IF NOT EXISTS visited_states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  visit_count INT DEFAULT 1,
  first_visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_state (user_id, state_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (state_name) REFERENCES states(name) ON DELETE CASCADE
);