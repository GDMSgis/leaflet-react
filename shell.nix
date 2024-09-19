{ pkgs ? import <nixpkgs> { } }:
with pkgs;

mkShell {
  buildInputs = [
    git
    yarn
    (python311.withPackages (ps: with ps; [
      pip
      fastapi
    ]))
  ];

  FLASK_APP = "flask-app/flask-app.py";
  FLASK_DEBUG = "True";

  shellHook = ''
    export PS1="\[\e[96m\](nix-shell)\[\e[0m\]$PS1"
  '';
}
