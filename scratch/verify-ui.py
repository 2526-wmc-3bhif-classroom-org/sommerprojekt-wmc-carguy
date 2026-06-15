import time
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to http://localhost:4200/communities...")
        page.goto('http://localhost:4200/communities')
        page.wait_for_load_state('networkidle')

        # 1. Verify that all 14 communities are loaded in the main list
        print("Verifying initial list of communities...")
        communities = page.locator('.lg\\:col-span-2 .premium-card h3').all_text_contents()
        print(f"Loaded communities in main list: {communities}")
        assert len(communities) == 14, f"Expected 14 communities, got {len(communities)}"

        # 2. Verify categories list in sidebar
        print("Verifying categories in sidebar...")
        category_buttons = page.locator('aside button').all()
        categories_text = [btn.inner_text().strip().split('\n')[-1] for btn in category_buttons if "Trending Communities" not in btn.inner_text()]
        print(f"Categories found: {categories_text}")
        expected_categories = ["All Categories", "Brands", "Motorsport", "General Advice", "Offroad & Overlanding", "Tuning & Performance", "Electric Vehicles", "Classic & Vintage", "DIY & Maintenance", "Car Photography", "Sim Racing & Gaming"]
        for expected in expected_categories:
            assert any(expected in cat for cat in categories_text), f"Missing category: {expected}"

        # 3. Filter by "Motorsport" category
        print("Filtering by 'Motorsport'...")
        motorsport_btn = page.locator('aside button:has-text("Motorsport")')
        motorsport_btn.click()
        page.wait_for_timeout(500) # Wait for animation/filter
        
        filtered = page.locator('.lg\\:col-span-2 .premium-card h3').all_text_contents()
        print(f"Filtered communities for Motorsport: {filtered}")
        assert len(filtered) == 1, f"Expected 1 filtered community, got {len(filtered)}"
        assert filtered[0] == "Formula 1", f"Expected 'Formula 1', got '{filtered[0]}'"

        # 4. Clear filter
        print("Clearing filter...")
        all_categories_btn = page.locator('aside button:has-text("All Categories")')
        all_categories_btn.click()
        page.wait_for_timeout(500)
        
        cleared_list = page.locator('.lg\\:col-span-2 .premium-card h3').all_text_contents()
        assert len(cleared_list) == 14, "Filter reset failed"


        # 5. Log in
        print("Navigating to login page...")
        page.goto('http://localhost:4200/login')
        page.wait_for_load_state('networkidle')
        
        print("Filling login details for max_m3...")
        page.fill('#login-username', 'max_m3')
        page.fill('#login-password', 'password123')
        page.click('button[type="submit"]')
        
        # Wait for redirect and storage
        page.wait_for_url('**/profile')
        print("Login successful! Redirected to profile page.")
        
        # Go back to communities
        print("Going back to communities...")
        page.goto('http://localhost:4200/communities')
        page.wait_for_load_state('networkidle')

        # 6. Verify "My Communities" tab is visible
        print("Verifying 'My Communities' tab is visible...")
        my_communities_tab = page.locator('a.tab:has-text("My Communities")')
        assert my_communities_tab.is_visible(), "My Communities tab not visible after login"

        # 7. Check "My Communities" tab content
        print("Switching to 'My Communities' tab...")
        my_communities_tab.click()
        page.wait_for_timeout(500)
        
        joined_communities = page.locator('.lg\\:col-span-2 .premium-card h3').all_text_contents()
        print(f"Joined communities for max_m3: {joined_communities}")
        # max_m3 subscriptions: BMW (1), Car Buying Advice (5), Tuning & Customization (7), Garage DIY & Maintenance (11)
        expected_joined = ["BMW", "Car Buying Advice", "Tuning & Customization", "Garage DIY & Maintenance"]
        for c in expected_joined:
            assert c in joined_communities, f"Expected {c} in joined list"

        # 8. Join a new community
        print("Switching back to 'Explore All' tab...")
        page.locator('a.tab:has-text("Explore All")').click()
        page.wait_for_timeout(500)

        # Audi Sport is forumId 3, max_m3 is not in it.
        # Find Audi Sport card in main list, check member count, and click Join.
        audi_card = page.locator('.lg\\:col-span-2 .premium-card:has-text("Audi Sport")')
        member_text_elem = audi_card.locator('p.text-xs')
        initial_member_text = member_text_elem.inner_text()
        print(f"Audi Sport initial status: {initial_member_text}")
        assert "2 members" in initial_member_text, f"Expected 2 members, got: {initial_member_text}"
        
        join_btn = audi_card.locator('button:has-text("Join")')
        print("Clicking Join on Audi Sport...")
        join_btn.click()
        page.wait_for_timeout(500)

        # Verify button changed to Leave
        leave_btn = audi_card.locator('button:has-text("Leave")')
        assert leave_btn.is_visible(), "Join button did not switch to Leave"
        
        new_member_text = member_text_elem.inner_text()
        print(f"Audi Sport new status: {new_member_text}")
        assert "3 members" in new_member_text, f"Member count did not increment. Got: {new_member_text}"

        # 9. Verify in "My Communities" tab
        print("Verifying Audi Sport in My Communities...")
        my_communities_tab.click()
        page.wait_for_timeout(500)
        joined_communities_new = page.locator('.lg\\:col-span-2 .premium-card h3').all_text_contents()
        assert "Audi Sport" in joined_communities_new, "Audi Sport did not appear in My Communities tab"

        # 10. Leave from "My Communities" tab
        print("Clicking Leave on Audi Sport from My Communities...")
        audi_card_joined = page.locator('.lg\\:col-span-2 .premium-card:has-text("Audi Sport")')
        audi_card_joined.locator('button:has-text("Leave")').click()
        page.wait_for_timeout(500)

        joined_communities_left = page.locator('.lg\\:col-span-2 .premium-card h3').all_text_contents()
        assert "Audi Sport" not in joined_communities_left, "Audi Sport was not removed from My Communities tab"
        print("Audi Sport successfully removed from My Communities.")

        # 11. Go back to Explore All and verify button is Join again and count is back to 2
        page.locator('a.tab:has-text("Explore All")').click()
        page.wait_for_timeout(500)
        
        audi_card_explore = page.locator('.lg\\:col-span-2 .premium-card:has-text("Audi Sport")')
        assert audi_card_explore.locator('button:has-text("Join")').is_visible(), "Button did not return to Join state"
        explore_member_text = audi_card_explore.locator('p.text-xs').inner_text()
        assert "2 members" in explore_member_text, f"Member count did not decrement. Got: {explore_member_text}"
        print("Audi Sport member count decremented back to 2.")

        print("\nAll E2E checks passed successfully! UI works beautifully and dynamically.")
        browser.close()

if __name__ == '__main__':
    run_verification()
