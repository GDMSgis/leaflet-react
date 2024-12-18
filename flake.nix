{
  description = "project flake";
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-23.11";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let pkgs = import nixpkgs { inherit system; config = {}; overlays = []; }; in
        {
          devShells.default = import ./shell.nix { inherit pkgs; };
        }
      );
}
