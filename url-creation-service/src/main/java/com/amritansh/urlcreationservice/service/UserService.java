    package com.amritansh.urlcreationservice.service;

    import com.amritansh.urlcreationservice.entity.User;
    import com.amritansh.urlcreationservice.repository.UserRepository;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.stereotype.Service;

    @Service
    public class UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

        public UserService(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
            this.userRepository = userRepository;
            this.passwordEncoder = passwordEncoder;
            this.jwtService = jwtService;
        }

        public User saveUser(User user) {

            user.setPassword(
                    passwordEncoder.encode(user.getPassword())
            );

            return userRepository.save(user);
        }

        public String login(String email, String password) {

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("Invalid email or password"));

            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }

            return jwtService.generateToken(user);
        }

        public User getUserByEmail(String email) {

            return userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));
        }
    }