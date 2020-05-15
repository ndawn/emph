<template lang="pug">
    #app
        #script-container(ref="scriptContainer")
        .container
            main.main
                h1.title {{ friendCount }} случайных друзей
                .error(v-if="error") {{ error }}
                button.auth-button(type="button" v-if="accessToken === null" @click="authRequest") Авторизоваться
                friend-card(
                    v-for="[id, friend] in friendEntries"
                    :key="id"
                    :friend="friend"
                )
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import FriendCard from '@/components/FriendCard.vue';
import { Friend, VkFriendResponse } from '@/types';


@Component({
  components: {
    FriendCard
  },
})
export default class App extends Vue {
    private friends: {[id: number]: Friend} = {};

    private friendCount = 5;

    private apiVersion = '5.103';
    private clientId = '6713277';

    private error: string | null = null;
    private accessToken: string | null = null;
    private requestCallbackFunctionName = 'VK_API_REQUEST_CALLBACK_FUNCTION';

    private authUrl = 'https://oauth.vk.com/authorize'
                      + '?client_id=' + this.clientId
                      + '&redirect_uri=' + process.env.VUE_APP_SITE_ADDRESS
                      + '&scope=friends'
                      + '&response_type=token'

    calculateCookieExpireDate (timeDelta: number): Date {
        return new Date(Date.now() + timeDelta * 1000);
    }

    checkHash (): string | null {
        if (!location.hash) {
            return null;
        }

        const urlParams = new URLSearchParams(location.hash.slice(1));

        if (!urlParams.has('access_token')) {
            return null;
        }

        const accessToken = urlParams.get('access_token')!;

        this.$cookies.set(
            'accessToken',
            accessToken,
            this.calculateCookieExpireDate(+urlParams.get('expires_in')!)
        )

        history.pushState('', document.title, location.pathname + location.search);

        return accessToken;
    }

    authRequest () {
        location.assign(this.authUrl);
    }

    friendRequest () {
        console.log('Commencing API request...');
        // @ts-ignore
        window[this.requestCallbackFunctionName] = this.requestCallback;

        const script = document.createElement('script');
        script.src = this.friendsRequestUrl;

        (this.$refs.scriptContainer as HTMLElement).appendChild(script);
    }

    requestCallback (data: VkFriendResponse) {
        console.log('Got API response:', data);

        if (data.error?.error_code === 5) {
            this.$cookies.remove('accessToken');
            return;
        }

        this.error = data.error?.error_msg || null;

        if (data.response?.items[0] && data.response?.items[0].first_name !== 'DELETED') {
            this.$set(this.friends, data.response?.items[0].id, data.response?.items[0]);
        }

        if (Object.keys(this.friends).length < this.friendCount) {
            this.friendRequest();
        }
    }

    get friendEntries (): [string, Friend][] {
        return Object.entries(this.friends);
    }

    get friendsRequestUrl (): string {
        return 'https://api.vk.com/method/friends.get'
            + '?v=' + this.apiVersion
            + '&access_token=' + this.accessToken
            + '&order=random'
            + '&count=1'
            + '&fields=photo_100,city'
            + '&callback=' + this.requestCallbackFunctionName;
    }

    @Watch('accessToken')
    onPropertyChanged (value: string | null) {
        value && this.friendRequest();
    }

    created () {
        if (!this.$cookies.isKey('accessToken')) {
            this.accessToken = this.checkHash();
        } else {
            this.accessToken = this.$cookies.get('accessToken');
        }
    }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');

html {
    background-color: #eee;
}

body {
    margin: 0;
    min-height: 100vh;
}

#app {
    font-family: 'Open Sans', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #222;

    .container {
        margin: auto;
        max-width: 720px;
        height: 100%;
    }

    .main {
        width: 100%;

        .title {
            text-align: center;
            font-size: 3em;
        }

        .error {
            margin: auto;
            text-align: center;
            color: #c00;
        }

        .auth-button {
            display: block;
            margin: auto;
            padding: 16px 36px;
            font-size: 1.4em;
            outline: none;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(30, 144, 255, 0.6);
            color: white;
            background: dodgerblue;
            transition: box-shadow 0.2s ease;
            cursor: pointer;

            &:hover {
                box-shadow: 0 4px 8px 4px rgba(30, 144, 255, 0.4);
            }
        }
    }
}
</style>
