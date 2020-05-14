from fabric import Connection


def main():
    c = Connection("ubuntu@152.32.226.93")
    with c.cd('/home/ubuntu/projects/CybexDotDexUAT'):
        c.run('git stash')
        c.run('git pull')
        c.run('git stash pop')
        c.run('/usr/bin/yarn')
        c.run('/usr/bin/yarn build')
        c.run('/home/ubuntu/.nvm/versions/node/v12.16.1/bin/pm2 restart cybex-dot-dex-uat')


if __name__ == '__main__':
    main()
