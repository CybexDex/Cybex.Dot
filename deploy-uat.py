from fabric import Connection, Config
import getpass

sudo_pass = getpass.getpass("What's your sudo password?")
config = Config(overrides={'sudo': {'password': sudo_pass}})


def main():
    c = Connection("ubuntu@152.32.226.93", config=config)
    c.run('cd /home/ubuntu/projects/CybexDotDexUAT')
    c.run('git pull')
    c.run('yarn build')
    c.run('pm2 restart 1')


if __name__ == '__main__':
    main()
