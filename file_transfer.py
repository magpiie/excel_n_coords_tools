import os
import shutil

def find_and_move_files(origin_path, pdf_path):
    hwp_files = {}
    file_count = 0  # 처리된 파일 수를 세기 위한 카운터

    # origin 폴더 내의 모든 hwp, hwpx 파일 경로 찾기
    for root, dirs, files in os.walk(origin_path):
        for file in files:
            if file.endswith('.hwp') or file.endswith('.hwpx'):
                hwp_files[file] = root
                print(f"발견: {os.path.join(root, file)}")  # 발견된 파일 로그 출력

    # pdf 폴더 내의 파일 확인 및 이동
    for pdf_file in os.listdir(pdf_path):
        if pdf_file.replace('.pdf', '.hwp') in hwp_files or pdf_file.replace('.pdf', '.hwpx') in hwp_files:
            original_file_name = pdf_file.replace('.pdf', '.hwp') if pdf_file.replace('.pdf', '.hwp') in hwp_files else pdf_file.replace('.pdf', '.hwpx')
            original_file_path = hwp_files[original_file_name]
            shutil.move(os.path.join(pdf_path, pdf_file), os.path.join(original_file_path, pdf_file))
            print(f"이동: {pdf_file} -> {os.path.join(original_file_path, pdf_file)}")  # 파일 이동 로그 출력
            file_count += 1

    print(f"총 {file_count}개의 pdf 파일을 이동했습니다.")  # 최종 처리된 파일 수 출력

# 실행 예시
origin_path = "C:/Users/JJJ/Desktop/report/origin"
pdf_path = "C:/Users/JJJ/Desktop/report/pdf"
find_and_move_files(origin_path, pdf_path)
