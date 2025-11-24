# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Welcome Back" [level=1] [ref=e5]
      - paragraph [ref=e6]: Sign in to your account to continue
    - generic [ref=e7]:
      - paragraph [ref=e9]: Invalid email or password
      - generic [ref=e10]:
        - generic [ref=e11]: Email Address
        - textbox "Email Address" [ref=e12]:
          - /placeholder: john@example.com
          - text: student@intime.com
      - generic [ref=e13]:
        - generic [ref=e14]: Password
        - textbox "Password" [ref=e15]:
          - /placeholder: ••••••••
          - text: password123
      - button "Sign In" [ref=e16] [cursor=pointer]
    - generic [ref=e17]:
      - link "Forgot your password?" [ref=e19] [cursor=pointer]:
        - /url: /forgot-password
      - generic [ref=e20]:
        - text: Don't have an account?
        - link "Sign up" [ref=e21] [cursor=pointer]:
          - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
```