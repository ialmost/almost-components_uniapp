<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
  page {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    min-height: 100%;
    background: transparent;
  }
  ::-webkit-scrollbar {  
    display: none;
    width: 0 !important;  
    height: 0 !important;  
    -webkit-appearance: none;  
    background: transparent;  
  }
</style>
