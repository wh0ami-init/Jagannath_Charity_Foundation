"""
List of every dynamic image slot on the site, with the seed file (already
part of the original site) to copy in on first run, so the site looks
correct immediately -- the VC can then replace any of them from /admin.
"""

IMAGE_SLOTS = [
    # slot_key, label, page, alt_text, seed_filename (must exist in seed_images/)
    ("home-hero-education", "Homepage hero photo 1 (education)", "Home", "Education programme", "hero-education.jpg"),
    ("home-hero-health", "Homepage hero photo 2 (health)", "Home", "Health programme", "hero-health.jpg"),
    ("home-hero-livelihoods", "Homepage hero photo 3 (livelihoods)", "Home", "Livelihoods programme", "hero-livelihoods.jpg"),
    ("home-hero-solar", "Homepage hero photo 4 (solar)", "Home", "Solar energy programme", "hero-solar.jpg"),
    ("home-gallery-kalam", "Homepage gallery: Dr A.P.J. Abdul Kalam", "Home", "Courtesy meeting with Dr A.P.J. Abdul Kalam", "meeting-president-kalam.jpg"),
    ("home-gallery-patil", "Homepage gallery: Smt. Pratibha Devisingh Patil", "Home", "Courtesy meeting with Smt. Pratibha Devisingh Patil", "meeting-president-patil.jpg"),
    ("home-gallery-mukherjee", "Homepage gallery: Shri Pranab Mukherjee", "Home", "Courtesy meeting with Shri Pranab Mukherjee", "meeting-president-mukherjee.jpg"),
    ("home-gallery-kovind", "Homepage gallery: Shri Ram Nath Kovind", "Home", "Courtesy meeting with Shri Ram Nath Kovind", "meeting-president-kovind.jpg"),
    ("home-gallery-murmu", "Homepage gallery: Smt. Droupadi Murmu", "Home", "Courtesy meeting with Smt. Droupadi Murmu", "meeting-president-murmu.jpg"),
    ("home-gallery-pm", "Homepage gallery: Prime Minister", "Home", "Courtesy meeting with the Prime Minister", "meeting-pm.jpg"),
    ("site-logo", "Site logo (header & footer)", "Global", "Jagannath Foundation logo", "logo-mark.png"),
    ("about-founder-photo", "Founder photo (About page)", "About", "Dr Jagannath Patnaik", "pp.jpg"),
    ("team-jagannath-patnaik", "Dr Jagannath Patnaik", "Team", "Dr Jagannath Patnaik", "pp.jpg"),
    ("team-samarendra-patra", "Er. Samarendra Patra", "Team", "Er. Samarendra Patra", "samarendra-patra.jpg"),
    ("team-sarita-patwal", "Ms Sarita Patwal", "Team", "Ms Sarita Patwal", "sarita-patwal.jpg"),
    ("team-prateek-nayak", "Adv. Prateek Nayak", "Team", "Adv. Prateek Nayak", "prateek-nayak.jpg"),
    ("team-reema-diddee", "CA Reema Diddee", "Team", "CA Reema Diddee", "reema-diddee.jpg"),
    ("team-lhamu-tshering-tamang", "Adv. Lhamu Tshering Tamang", "Team", "Adv. Lhamu Tshering Tamang", "lhamu-tshering-tamang.jpg"),
    ("gallery-cover", "Gallery page cover image", "Gallery", "Foundation gallery", "handshake-bg.jpg"),
    ("work-education", "Work page: Education & literacy", "Work", "Education and literacy programme", "hero-education.jpg"),
    ("work-health", "Work page: Health & family welfare", "Work", "Health and family welfare programme", "hero-health.jpg"),
    ("work-livelihoods", "Work page: Women's livelihoods", "Work", "Women's livelihoods programme", "hero-livelihoods.jpg"),
    ("work-solar", "Work page: Solar housing & clean energy", "Work", "Solar housing programme", "hero-solar.jpg"),

    # Full gallery page -- add more rows here any time; the admin panel
    # picks up new slots automatically after a backend restart.
    ("gallery-kalam", "Dr A.P.J. Abdul Kalam", "Gallery", "Courtesy meeting with Dr A.P.J. Abdul Kalam, 11th President of India", "meeting-president-kalam.jpg"),
    ("gallery-patil", "Smt. Pratibha Devisingh Patil", "Gallery", "Courtesy meeting with Smt. Pratibha Devisingh Patil, 12th President of India", "meeting-president-patil.jpg"),
    ("gallery-mukherjee", "Shri Pranab Mukherjee", "Gallery", "Courtesy meeting with Shri Pranab Mukherjee, 13th President of India", "meeting-president-mukherjee.jpg"),
    ("gallery-kovind", "Shri Ram Nath Kovind", "Gallery", "Courtesy meeting with Shri Ram Nath Kovind, 14th President of India", "meeting-president-kovind.jpg"),
    ("gallery-murmu", "Smt. Droupadi Murmu", "Gallery", "Courtesy meeting with Smt. Droupadi Murmu, 15th President of India", "meeting-president-murmu.jpg"),
    ("gallery-pm-modi", "Prime Minister Shri Narendra Modi", "Gallery", "Courtesy meeting with the Prime Minister", "meeting-pm.jpg"),
    ("gallery-manmohan-singh", "Dr Manmohan Singh", "Gallery", "Courtesy meeting with former Prime Minister Dr Manmohan Singh", "meeting-manmohan-singh.jpg"),
    ("gallery-vp-dhankhar", "Vice President Shri Jagdeep Dhankhar", "Gallery", "Courtesy meeting with the Vice President", "meeting-vp-dhankhar.jpg"),
    ("gallery-amit-shah", "Shri Amit Shah", "Gallery", "Courtesy meeting with Union Home Minister Shri Amit Shah", "meeting-amit-shah.jpg"),
    ("gallery-rajnath-singh", "Shri Rajnath Singh", "Gallery", "Courtesy meeting with Raksha Mantri Shri Rajnath Singh", "meeting-rajnath.jpg"),
    ("gallery-om-birla", "Shri Om Birla", "Gallery", "Courtesy meeting with Lok Sabha Speaker Shri Om Birla", "meeting-om-birla.jpg"),
    ("gallery-jp-nadda", "Shri J.P. Nadda", "Gallery", "Courtesy meeting with Shri J.P. Nadda", "meeting-jp-nadda.jpg"),
    ("gallery-dharmendra-pradhan", "Shri Dharmendra Pradhan", "Gallery", "Courtesy meeting with Union Minister Shri Dharmendra Pradhan", "meeting-dharmendra-pradhan.jpg"),
    ("gallery-anna-hazare", "Shri Anna Hazare", "Gallery", "Courtesy meeting with social activist Shri Anna Hazare", "meeting-anna-hazare.jpg"),
    ("gallery-sri-sri", "Sri Sri Ravi Shankar", "Gallery", "Courtesy meeting with Sri Sri Ravi Shankar", "meeting-sri-sri.jpg"),
    ("gallery-baba-ramdev", "Swami Ramdev", "Gallery", "Courtesy meeting with Swami Ramdev", "meeting-ramdev.jpg"),
    ("gallery-hemant-soren", "Shri Hemant Soren", "Gallery", "Courtesy meeting with Jharkhand CM Shri Hemant Soren", "meeting-hemant-soren.jpg"),
    ("gallery-cm-sikkim", "Chief Minister, Sikkim", "Gallery", "Courtesy meeting with the Chief Minister of Sikkim", "meeting-cm-sikkim.jpg"),
    ("gallery-governor-icfai", "Governor's visit, ICFAI University Sikkim", "Gallery", "Governor's visit at ICFAI University Sikkim", "meeting-governor-icfai.jpg"),
    ("gallery-bhutan-official", "Courtesy call, Bhutan", "Gallery", "Courtesy meeting with a Bhutanese official", "meeting-bhutan-official.jpg"),
    ("gallery-venkaiah-naidu", "Shri M. Venkaiah Naidu", "Gallery", "Courtesy meeting with former Vice President Shri M. Venkaiah Naidu", "meeting-venkaiah-naidu.jpg"),
]
