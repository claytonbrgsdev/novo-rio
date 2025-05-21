from setuptools import setup, find_packages

setup(
    name="novo_rio_backend",
    version="0.1",
    packages=find_packages(),
    install_requires=open('requirements.txt').read().splitlines(),
    extras_require={
        'dev': open('requirements-dev.txt').read().splitlines(),
    },
)
