
from imutils.perspective import four_point_transform
from easyocr.easyocr import *
import sys
import json
import numpy as np
import requests
import re
import cv2
import imutils
import matplotlib.pyplot as plt
import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'

os.environ['CUDA_VISIBLE_DEVICES'] = '0,1'


# GPU 설정


# 처음 이미지경로 './test_na.PNG'


# OCR
def get_files(path):
    file_list = []

    # skip hidden file
    files = [f for f in os.listdir(path) if not f.startswith('.')]
    files.sort()
    abspath = os.path.abspath(path)
    for file in files:
        file_path = os.path.join(abspath, file)
        file_list.append(file_path)

    return file_list, len(file_list)


if __name__ == '__main__':
    image_file_path = sys.argv[1]
    image = cv2.imread(image_file_path, cv2.IMREAD_GRAYSCALE)
    # print(image_file_path)
    # Define the desired resolution

    desired_resolution = (3.5, 3.5)  # Increase the resolution by a factor of 2

    # Resize the image to the desired resolution using bilinear interpolation
    resized = cv2.resize(
        image, None, fx=desired_resolution[0], fy=desired_resolution[1], interpolation=cv2.INTER_LINEAR)

    # Apply adaptive thresholding to enhance small text visibility
    adaptive_thresh = cv2.adaptiveThreshold(
        resized, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, blockSize=15, C=2)

    # Perform morphological operations to further enhance text visibility
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    morphed = cv2.morphologyEx(
        adaptive_thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    morphed_inverse = cv2.bitwise_not(morphed)

# 이미지 전처리후 저장하기
    cv2.imwrite("./workspace/demo_images/test123.png", morphed_inverse)

    reader = Reader(['ko'], gpu=True,
                    model_storage_directory='./workspace/user_model',
                    user_network_directory='./workspace/user_network',
                    recog_network='custom')

    files, count = get_files('./workspace/demo_images')
    # print(files)
    text_result = reader.readtext(files[0], detail=0)
    # print(text_result)
    json_data = {}

    for idx, text in enumerate(text_result):
        if '성명' in text:
            json_data['성명'] = text_result[idx+1]
        if '성별' in text:
            json_data['성별'] = text_result[idx+1]
        if '생년' in text:
            json_data['생년월일'] = text_result[idx+1]
        if '병역' in text:
            json_data['병역사항'] = text_result[idx+1]
        if '주소' in text:
            json_data['주소'] = text_result[idx+1]
        if '연락처' in text:
            json_data['연락처'] = text_result[idx+1]
        if 'email' in text:
            json_data['email'] = text_result[idx+1]

    json_dumps_data = json.dumps(json_data, indent=2, ensure_ascii=False)

    print(json_dumps_data)
