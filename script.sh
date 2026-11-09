
#!/bin/bash

set -e

echo "======================================"
echo " Installing NS-2.35 and NAM-1.15"
echo "======================================"

# 1. Install yay if not already installed
if ! command -v yay &> /dev/null; then
    echo "[1/5] Installing yay..."

    sudo pacman -S --needed git base-devel

    git clone https://aur.archlinux.org/yay.git
    cd yay
    makepkg -si --noconfirm
    cd ..
    rm -rf yay
else
    echo "[1/5] yay is already installed."
fi

# 2. Install GCC 4.8
echo "[2/5] Installing gcc48..."
yay -S --needed gcc48 --noconfirm

# 3. Download and extract NS-2.35
echo "[3/5] Downloading NS-2.35..."

if [ ! -f ns-allinone-2.35_gcc5.tar.gz ]; then
    echo "Please place ns-allinone-2.35_gcc5.tar.gz in the current directory."
    exit 1
fi

tar -xf ns-allinone-2.35_gcc5.tar.gz

cd ns-allinone-2.35/

# 4. Install dependencies
echo "[4/5] Installing dependencies..."
sudo pacman -S --needed libx11 libxmu

# 5. Build NS-2.35 and NAM-1.15
echo "[5/5] Building NS-2.35 and NAM-1.15..."

export CC=gcc-4.8
export CXX=g++-4.8

./install

# Install NAM
echo "Installing NAM-1.15..."
cd nam-1.15/
sudo make install

# Install NS-2
echo "Installing NS-2.35..."
cd ../ns-2.35/
sudo make install

echo "======================================"
echo " NS-2.35 and NAM-1.15 installation completed!"
echo "======================================"
