git filter-branch -f --env-filter "
    GIT_AUTHOR_NAME='immutable-developer'
    GIT_AUTHOR_EMAIL='immutable-org@protonmail.com'
    GIT_COMMITTER_NAME='immutable-developer'
    GIT_COMMITTER_EMAIL='immutable-org@protonmail.com'
  " HEAD