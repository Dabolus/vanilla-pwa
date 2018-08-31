## Contributing to Vanilla PWA

First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to this PWA. These are mostly guidelines, not rules.
Use your best judgment, and feel free to propose changes to this document in a pull request.

### How can I contribute?

#### Reporting bugs
Before reporting a bug, please make sure it hasn't already been reported by visiting the
[issue section](https://github.com/Dabolus/vanilla-pwa/issues).

If the bug you found hasn't been reported yet, create a new issue and assign it the proper label(s).
Besides this, there isn't any specific guideline on how the bugs should be reported, Just be sure
to be as clear as possible when describing it.

#### Suggesting enhancements
Same as the bug reporting. First of all, check if the enhancement has already been suggested.
If it doesn't exist, create a new issue and give it the `enhancement` label, plus any other proper label.

Keep in mind that what you may find useful might be completely useless for other users,
so please, make sure that the enhancement can actually be useful for everyone before proposing it.
If you find that it is actually useful only for you, consider forking the project and implementing that
enhancement just for yourself.

### Styleguides

#### Commit messages
- Start the commit message with the type of commit, that can be one of the following:
  - **feat:** a new feature
  - **fix:** a bug fix
  - **docs:** changes to documentation
  - **style:** formatting, missing semi colons, etc; no code change
  - **refactor:** refactoring production code
  - **chore:** updating Firebase configuration or any other configuration in general; no production code change
- Use the present tense ("Add feature" not "Added feature")
- The type of the message has to be all lowercase; the rest of the message has to start with an uppercase letter
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- When only changing documentation, include `[ci skip]` in the commit title

An example of a great commit message might be:

`docs: Fix typo in the readme [ci skip]`

#### Pull Requests
- Specify what has been changed/added/removed
- Write a short and concise title. Be more specific in the description
- Do not include issue numbers in the PR title; you have to add them at the bottom of the description
- End all files with a newline
