import os
import shutil

def find_and_move_files(origin_path, pdf_path, moved_path):
    hwp_files = {}
    
    # origin 폴더 내의 모든 hwp, hwpx 파일 경로 찾기
    for root, dirs, files in os.walk(origin_path):
        for file in files:
            if file.endswith('.hwp') or file.endswith('.hwpx'):
                relative_path = os.path.relpath(root, origin_path)  # origin 기준 상대 경로
                hwp_files[file] = relative_path
                print(f"발견: {os.path.join(root, file)}")

    # pdf 폴더 내의 파일 확인 및 이동
    for pdf_file in os.listdir(pdf_path):
        base_name = pdf_file.replace('.pdf', '')
        hwp_name = base_name + '.hwp'
        hwpx_name = base_name + '.hwpx'
        
        if hwp_name in hwp_files or hwpx_name in hwp_files:
            original_relative_path = hwp_files.get(hwp_name, '') or hwp_files.get(hwpx_name, '')
            target_path = os.path.join(moved_path, original_relative_path)
            
            # 해당 경로가 없으면 생성
            if not os.path.exists(target_path):
                os.makedirs(target_path)
                print(f"경로 생성: {target_path}")
            
            # 파일 이동
            shutil.move(os.path.join(pdf_path, pdf_file), os.path.join(target_path, pdf_file))
            print(f"이동: {pdf_file} -> {target_path}")

# 실행 예시
origin_path = "C:/Users/JJJ/Desktop/report/origin"
pdf_path = "C:/Users/JJJ/Desktop/report/pdf"
moved_path = 'C:/Users/JJJ/Desktop/report/moved'
find_and_move_files(origin_path, pdf_path, moved_path)
